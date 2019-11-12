import happybase

# 连接数据库
connection = happybase.Connection(host='', port=9090, protocol='compact')

# 查询所有表
table_name_list = connection.tables()

# 建表
families = {
	'user_info': dict(),
	'history': dict()
}

# connection.create_table('rrr', families)

table = connection.table('rrr')
# 批量添加
print("create rrr OK")
bat = table.batch()
print("beginning")
bat.put('row-key1', {'family:key1': 'value1', 'family:key2': 'value2'})
print("first")
bat.put('row-key2', {'family:key1': 'value1', 'family:key2': 'value2'})
print("finished")
bat.send()

# 批量查询
rows_list = table.rows(['row-key1', 'row-key2'])  # 返回list

rows_dict = dict(table.rows(['row-key1', 'row-key2']))# 返回dict
