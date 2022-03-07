const { testTrue, parseSelect, preventXss } = require('./query-data')

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'localhost',
      user : 'client',
      password : 'password',
      database : 'rmdev'
    }
  })

describe('testing select data', () => {
    beforeEach(async () => {
        try {
            let queryCreate = "CREATE TABLE `ms_test` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `test_name` varchar(200) NOT NULL);"
            await knex.raw(queryCreate)
            return await knex.raw("INSERT INTO `ms_test` (`test_name`) VALUES ('test nama 1');")
        } catch (error) {
            return error
        }
    });

    afterEach(async () => {
        try {
            return await knex.raw("DROP TABLE ms_test")
        } catch (error) {
            return error
        }
    });

    test('select all ms_test', async () => {
        const input = {body: {"table": "ms_test"}}
    
        const expectedResult = [
            {
                id: 1,
                test_name: 'test nama 1'
            }
        ]
        let result = null
        try {
            result = await parseSelect(input)    
        } catch (error) {
            result = 'terjadi kesalahan'
        }
        return expect(result).toEqual(expectedResult)
    })
})

describe('testing inject drop', () => {
    beforeEach(async () => {
        try {
            let queryCreate = "CREATE TABLE `ms_test_drop` (`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `test_name` varchar(200) NOT NULL);"
            return await knex.raw(queryCreate)
        } catch (error) {
            return error
        }
    });

    afterEach(async () => {
        try {
            return await knex.raw("DROP TABLE ms_test_drop")
        } catch (error) {
            return error
        }
    });

    test('drop table --', async () => {
        const input = {
            body: {
                "table": "ms_test_drop",
                "column": [
                    "id",
                    {
                        "type": "expression", 
                        "colname": "drop table ms_test_drop --", 
                        "value": {
                        } 
                    }
                ]
            }
        }
    
        let result = null
        try {
            result = await parseSelect(input)    
        } catch (error) {
            result = 'terjadi kesalahan'
        }
        return expect(result).toBe('terjadi kesalahan')
    })
})

test('Test prevent xss', () => {
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    expect(preventXss("<script>alert('halo');</script>")).toBe("&lt;script&gt;alert('halo');&lt;/script&gt;")
})