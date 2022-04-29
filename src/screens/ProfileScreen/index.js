import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Auth, DataStore } from 'aws-amplify';
import { User } from '../../models';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const { dbUser } = useAuthContext();
  const navigation = useNavigation();

  const [name, setName] = useState(dbUser?.name || '');
  const [address, setAddress] = useState(dbUser?.address || '');
  const [lat, setLat] = useState(dbUser?.lat + '' || '0');
  const [lng, setLng] = useState(dbUser?.lng + '' || '0');

  const { sub, setDbUser } = useAuthContext();

  const onSave = async () => {
    if (dbUser) {
      await updateUser();
    } else {
      await createUser();
    }
    navigation.goBack();
  };

  const updateUser = async () => {
    const user = await DataStore.save(
      User.copyOf(dbUser, (updated) => {
        updated.name = name;
        updated.address = address;
        updated.lat = parseFloat(lat);
        updated.lng = parseFloat(lng);
      })
    );
    setDbUser(user);
  };

  const createUser = async () => {
    try {
      const user = await DataStore.save(
        new User({
          name,
          address,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          sub,
        })
      );
      setDbUser(user);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // useEffect(() => {
  //   DataStore.query(User, (user) => user.sub('eq', sub)).then((users) =>
  //     setDbUser(users[0])
  //   );
  // }, [sub]);

  return (
    <SafeAreaView>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder='Name'
        style={styles.input}
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder='Address'
        style={styles.input}
      />
      <TextInput
        value={lat}
        onChangeText={setLat}
        placeholder='Latitude'
        style={styles.input}
        keyboardType='numeric'
      />
      <TextInput
        value={lng}
        onChangeText={setLng}
        placeholder='Longitude'
        style={styles.input}
      />
      <Button
        onPress={onSave}
        title={`${dbUser ? 'Update' : 'Save'}`}
        style={{ margin: 10 }}
      />
      <Text
        onPress={() => Auth.signOut()}
        style={{ color: 'red', textAlign: 'center', margin: 10 }}
      >
        Logout
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  input: {
    margin: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
  },
});

export default Profile;
