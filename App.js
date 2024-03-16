import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mydb.db');

export default function App() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState('');

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, name text);'
      );
    });
    refreshItems();
  }, []);

  const refreshItems = () => {
    db.transaction(tx => {
      tx.executeSql('select * from items', [], (_, { rows }) =>
        setItems(rows._array)
      );
    });
  };

  const addItem = () => {
    if (itemName.trim() === '') {
      alert('Please enter an item name');
      return;
    }
    db.transaction(
      tx => {
        tx.executeSql('insert into items (name) values (?)', [itemName]);
      },
      null,
      () => {
        refreshItems();
        setItemName('');
      }
    );
  };

  const deleteItem = (id) => {
    db.transaction(
      tx => {
        tx.executeSql('delete from items where id = ?', [id]);
      },
      null,
      refreshItems
    );
  };

  const editItem = () => {
    if (editedItemName.trim() === '') {
      alert('Please enter a new item name');
      return;
    }
    db.transaction(
      tx => {
        tx.executeSql('update items set name = ? where id = ?', [editedItemName, editItemId]);
      },
      null,
      () => {
        refreshItems();
        setEditMode(false);
        setEditItemId(null);
        setEditedItemName('');
      }
    );
  };

  const toggleEditMode = (id, name) => {
    setEditMode(true);
    setEditItemId(id);
    setEditedItemName(name);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        onChangeText={text => setItemName(text)}
        value={itemName}
      />
      <Button onPress={addItem} title="Add Item" />
      <FlatList
        style={{ width: '100%', marginTop: 100}}
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {editMode && editItemId === item.id ? (
              <TextInput
                style={styles.editInput}
                onChangeText={text => setEditedItemName(text)}
                value={editedItemName}
              />
            ) : (
              <Text>{item.name}</Text>
            )}
            <View style={styles.buttonContainer}>
              {editMode && editItemId === item.id ? (
                <Button title="Save" onPress={editItem} />
              ) : (
                <>
                <View style={styles.buttons}>
                  <Button title="Edit" onPress={() => toggleEditMode(item.id, item.name)} />
                  <Button title="Delete" onPress={() => deleteItem(item.id)} />
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop:100,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  buttons: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row', 
  },
});
