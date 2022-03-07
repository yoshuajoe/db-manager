const { parseSelect, parseInsert, parseUpdate, parseDelete } = require('./query-parser') 

test('Test select all from table', () => {
    const req = {
        body: {
            "table": "ms_test",
            "column": [
                
            ]
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test`')
})

test('Test select column from table', () => {
    const req = {
        body: {
            "table": "ms_test",
            "column": [
                "col1", "col2 as c2",
                {
                    "type": "expression", 
                    "colname": "count(1) as :alias:", 
                    "value": {
                        "alias": "cnt"
                    } 
                }
            ]
        }
    }
    expect(parseSelect(req)).toBe('select count(1) as `cnt`, `col1`, `col2` as `c2` from `ms_test`')
})

test('Test select where', () => {
    const req = {
        body: {
            "table": "ms_test",
            "filter": {
                "type": "and",
                "fields": [
                  {
                      "name": "id",
                      "value": 0,
                      "op": "gte"
                  }
                ]
          }
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` where `id` >= 0')
})

test('Test select where and', () => {
    const req = {
        body: {
            "table": "ms_test",
            "filter": {
                "type": "and",
                "fields": [
                  {
                      "name": "id",
                      "value": 0,
                      "op": "gte"
                  },
                  {
                    "name": "id",
                    "value": 25,
                    "op": "lte"
                    }
                ]
          }
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` where `id` >= 0 and `id` <= 25')
})

test('Test select where or', () => {
    const req = {
        body: {
            "table": "ms_test",
            "filter": {
                "type": "or",
                "fields": [
                  {
                      "name": "id",
                      "value": 0,
                      "op": "gte"
                  },
                  {
                    "name": "id",
                    "value": 25,
                    "op": "lte"
                    }
                ]
          }
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` where `id` >= 0 or `id` <= 25')
})

test('Test select order by', () => {
    const req = {
        body: {
            "table": "ms_test",
            "order": [
                {"name": "description", "type": "desc"},
                {"name": "name", "type": "asc"}
            ],
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` order by `description` desc, `name` asc')
})

test('Test select group by, limit, and offset', () => {
    const req = {
        body: {
            "table": "ms_test",
            "group": ["name", "description"],
            "limit": 10,
            "offset": 1
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` group by `name`, `description` limit 10 offset 1')
})

test('Test inner join', () => {
    const req = {
        body: {
            "table": "ms_test",
            "join": [
                {
                    "name": "lt_test_status as status",
                    "type": "inner", 
                    "kind":"table", 
                    "constraint":[
                        {
                            "source":"ms_test.test_status_id",
                            "dest":"status.id",
                            "op": "eq"
                        }
                    ]
                }
            ]
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` inner join `lt_test_status` as `status` on (`ms_test`.`test_status_id` = `status`.`id`)')
})

test('Test left join with column', () => {
    const req = {
        body: {
            "table": "ms_test",
            "column": [
                "ms_test.id as id",
                "ms_test.name as name",
                "status.name as status"
            ],
            "join": [
                {
                    "name": "lt_test_status as status",
                    "type": "left", 
                    "kind":"table", 
                    "constraint":[
                        {
                            "source":"ms_test.test_status_id",
                            "dest":"status.id",
                            "op": "eq"
                        }
                    ]
                }
            ]
        }
    }
    expect(parseSelect(req)).toBe('select `ms_test`.`id` as `id`, `ms_test`.`name` as `name`, `status`.`name` as `status` from `ms_test` left join `lt_test_status` as `status` on (`ms_test`.`test_status_id` = `status`.`id`)')
})

test('Test right join', () => {
    const req = {
        body: {
            "table": "ms_test",
            "join": [
                {
                    "name": "lt_test_status as status",
                    "type": "right", 
                    "kind":"table", 
                    "constraint":[
                        {
                            "source":"ms_test.test_status_id",
                            "dest":"status.id",
                            "op": "eq"
                        }
                    ]
                }
            ]
        }
    }
    expect(parseSelect(req)).toBe('select * from `ms_test` right join `lt_test_status` as `status` on (`ms_test`.`test_status_id` = `status`.`id`)')
})

test('Test insert into', () => {
    const req = {
        body: {
            "table": "ms_test",
            "column_values": [
                {
                    "created_at": {
                        "raw": "now()"
                    },
                    "name": "terserah",
                    "description": "warga +62"
                },
                {
                    "created_at": {
                        "raw": "now()"
                    },
                    "name": {
                        "raw": "concat('terserah2', 'CAT')"

                        },
                    "description": "warga terserah"
                }
            ]
        }
    }

    expect(parseInsert(req)).toBe("insert into `ms_test` (`created_at`, `description`, `name`) values (now(), 'warga +62', 'terserah'), (now(), 'warga terserah', concat('terserah2', 'CAT'))")
})

test('Test update with filter query', () => {
    const req = {
        body: {
            "table": "ms_test",
            "column_value": {
                "created_at": {
                    "raw": "now()"
                },
                "name": "naruto uzumaki",
                "description": "warga konoha"
            },
            "filter": {
                "type": "or",
                "fields": [
                  {
                    "name": "id",
                    "value": 25,
                    "op": "eq"
                    }
                ]
          }
        }
    }

    expect(parseUpdate(req)).toBe("update `ms_test` set `created_at` = now(), `name` = 'naruto uzumaki', `description` = 'warga konoha' where `id` = 25")
})

test('Test update all query', () => {
    const req = {
        body: {
            "table": "ms_test",
            "column_value": {
                "created_at": {
                    "raw": "now()"
                },
                "name": "naruto uzumaki",
                "description": "warga konoha"
            }
        }
    }

    expect(parseUpdate(req)).toBe("update `ms_test` set `created_at` = now(), `name` = 'naruto uzumaki', `description` = 'warga konoha'")
})



test('Test delete with filter query', () => {
    const req = {
        body: {
            "table": "ms_test",
             "filter": {
                  "type": "and",
                  "fields": [
                        { "name": "id", "value": 3, "op": "eq"}
                  ]
            }
        }
    }

    expect(parseDelete(req)).toBe("delete from `ms_test` where `id` = 3")
})

test('Test delete all query', () => {
    const req = {
        body: {
            "table": "ms_test"
        }
    }

    expect(parseDelete(req)).toBe("delete from `ms_test`")
})