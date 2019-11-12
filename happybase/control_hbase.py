import happybase
import csv

conn = happybase.Connection(host='', port=9090)

def test_table(table_name):
    tables = str(conn.tables())
    if table_name in tables:
        print("此表已存在")
    else:
        print("此表不存在，可创建")

def convert(data):
    if isinstance(data, bytes):  return data.decode('ascii')
    if isinstance(data, dict):   return dict(map(convert, data.items()))
    if isinstance(data, tuple):  return map(convert, data)
    return data

def load_csv(filename, new_name):
    table = conn.table('test_table')
    data = convert(table.row(filename))
    rows = []
    for i in range(1,len(data)+1):
        rows.append(eval(data['cf1:'+str(i)].replace(" ","")))
    with open(new_name, 'w', encoding='utf-8-sig')as f:
        f_csv = csv.writer(f)
        f_csv.writerows(rows)

def send_hbase(filename, data):
    table = conn.table('test_table')
    table.put(row=filename, data=data)

def save_csv(file_name):

    csv_file=csv.reader(open(file_name,'r', encoding='utf-8-sig'))
    data = {}
    head = []
    i = 1
    for line in csv_file:
        print(str(line))
        data.update({'cf1:'+str(i): str(line)})
        i = i + 1
    send_hbase(file_name, data)

if __name__ == '__main__':
    test_table("test_table")
    print("test")
    save_csv("test.csv")
    print("save")
    load_csv("test.csv","new.csv")
    print("load")
