const Knex = require('knex')

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'localhost',
      user : 'client',
      password : 'password',
      database : 'rmdev'
    }
  })

exports.testTrue = () => {
    return true
}

exports.drop = async(req, res) => {

}


exports.parseSelect = (req) => {
    try {
        const table = req.body.table
        let sql = knex
        sql = parseColumn(req.body.column, sql)
        sql = parseFilter(req.body.filter, sql)
        sql = parseOffset(req.body.offset, sql)
        sql = parseLimit(req.body.limit, sql)
        sql = parseOrder(req.body.order, sql)
        sql = parseGroup(req.body.group, sql)
        sql = parseJoin(req.body.join, sql)
        sql = sql.select().from(table)
        return sql.toQuery()
    } catch (error) {
        console.error(error)
        
        return error.message
    }

}

exports.parseInsert = (req) => {
    try {
        const table = req.body.table
        const column = req.body.column_values
        if (column) {
            let sql = knex(table)
            sql = insertQuery(column, sql)
            
            return  sql.toQuery()
        } else {
            return 'undefined object \'column_values\''
        }
    } catch (error) {
        console.error(error)
        
        return error.message
    }
}

exports.parseUpdate = (req) => {
    try {
        const table = req.body.table
        const column = req.body.column_value
        const filter = req.body.filter
        if (column) {
            let sql = knex(table)
            if(filter){
               sql = parseFilter(filter, sql)
               sql = updateQuery(column, sql)
            } else {
                sql = updateQuery(column, sql)
            }
            
            return sql.toQuery()
        } else {
            return 'undefined object \'column_values\''
        }
    } catch (error) {
        console.error(error)
        
        return error.message
    }
}

exports.parseDelete = (req) => {
    try {
        const table = req.body.table
        const filter = req.body.filter
        let sql = knex(table)
        if(filter){
            sql = parseFilter(filter, sql)
            sql = sql.del()
        } else {
            sql = sql.del()
        }
            
        return sql.toQuery()
    } catch (error) {
        return error.message
    }
}

function insertQuery(column, sql){
    const inserts = []
    column.forEach((col, i) => {
        let param = col
        Object.keys(col).forEach((key) => {
            const col_type = typeof col[key]
            
            if(col_type == 'object'){
                param[key] = knex.raw(col[key].raw)
            }
        })
        inserts.push(param)
    })
    
    return sql.insert(inserts)
}

function updateQuery(column, sql) {
    let dataColumn = column  
    Object.keys(column).forEach((key) => {
        const col_type = typeof column[key]
        
        if(col_type == 'object'){
            dataColumn[key] = knex.raw(column[key].raw)
        }
    })

    return sql.update(dataColumn)
}

function parseColumn(column, sql) {
    const columns = []
    
    if (column) {
        column.forEach((col) => {
            typeCol = typeof col
            
            if(typeCol === "object") {
                if(col.type && col.type.length > 0) {
                    switch (col.type) {
                        case "column":
                            columns.push(col.colname)
                            break                        
                        case "expression":
                            if(col.colname.length > 0 && (typeof col.value) === "object") {
                                sql = sql.column(sql.raw(col.colname, col.value))
                            }
                            break
                        default:
                            
                            break
                    }
                }
            } else {
                columns.push(col)
            }
        })
    }

    if (columns.length > 0) return sql.column(columns)


    return sql
}

function get_sql_op(op, value) {
    if (op == "eq") {
        if (value != null) {
            return "="
        } else {
            return "is"
        }
    }
    if (op == "neq") {
        if (value != null) {
            return "!="
        } else {
            return "is"
        }
    }
    if (op == "gt") {
        return ">"
    }
    if (op == "gte") {
        return ">="
    }
    if (op == "lt") {
        return "<"
    }
    if (op == "lte") {
        return "<="
    }
    if (op == "like") {
        return "like"
    }
    return "undefined"
}

function parseFilter(filter, sql) {
    if (filter) {
        if (filter.fields) {
            const fields = filter.fields
            fields.forEach((field, i) => {
                if (i == 0) {
                    sql = sql.where(field.name, get_sql_op(field.op, field.value), field.value)
                } else {
                    if (filter.type == 'and') {
                        sql = sql.andWhere(field.name, get_sql_op(field.op, field.value), field.value)
                    }
                    else if (filter.type == 'or') {
                        sql = sql.orWhere(field.name, get_sql_op(field.op, field.value), field.value)
                    }
                }
            })
        }
    }

    return sql
}

function parseOrder(order, sql) {
    const orders = []
    if (order) {
        order.forEach((ord) => {
            orders.push({
                column: ord.name,
                order: ord.type
            })
        })
    }
    
    if (orders.length > 0) {
        return sql.orderBy(orders)
    }

    return sql
}

function parseLimit(limit, sql) {
    if (limit) return sql.limit(limit) 
    return sql
}

function parseOffset(offset, sql) {
    if (offset) return sql.offset(offset)
    return sql
}

function parseGroup(group, sql) {
    if (group) {
        group.forEach((col) => {
            sql = sql.groupBy(col)
        })
    }
    return sql
}

function parseJoin(join, sql) {
    if (join) {
        join.forEach((obj) => {
            if (obj.type == 'left') {
                sql = sql.leftJoin(obj.name, function() {
                    if (obj.constraint) {
                        this.on(function () {
                            obj.constraint.forEach((objCons, i) => {
                                if (i === 0) {
                                    this.on(objCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                } else {
                                    if (objCons.type == 'and') {
                                        this.andOn(bjCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                    } else if (objCons.type == 'and') {
                                        this.orOn(bjCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                    }
                                }
                            })
                        })
                    }
                })
            } else if (obj.type == 'right') {
                sql = sql.rightJoin(obj.name, function() {
                    if (obj.constraint) {
                        this.on(function () {
                            obj.constraint.forEach((objCons, i) => {
                                if (i === 0) {
                                    this.on(objCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                } else {
                                    if (objCons.type == 'and') {
                                        this.andOn(bjCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                    } else if (objCons.type == 'and') {
                                        this.orOn(bjCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                    }
                                }
                            })
                        })
                    }
                })
            } else if (obj.type == 'inner') {
                sql = sql.innerJoin(obj.name, function() {
                    if (obj.constraint) {
                        this.on(function () {
                            obj.constraint.forEach((objCons, i) => {
                                if (i === 0) {
                                    this.on(objCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                } else {
                                    if (objCons.type == 'and') {
                                        this.andOn(bjCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                    } else if (objCons.type == 'and') {
                                        this.orOn(bjCons.source, get_sql_op(objCons.op, "value"), objCons.dest)
                                    }
                                }
                            })
                        })
                    }
                })
            }
        })

    }

    return sql
}