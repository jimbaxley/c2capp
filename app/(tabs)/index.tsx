import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, FlatList, View, Linking, Pressable, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import { useEffect, useState } from 'react';
import axios from 'axios';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const apiUrl = 'https://coda.io/apis/v1/docs/OySK5JOQh-/tables/table-X_KTN98R_x/rows';
        const apiToken = process.env.EXPO_PUBLIC_CODA_API_TOKEN;
        const requestTimeout = 30000;

        if (!apiToken) {
          setError('API Token is not configured. Please set EXPO_PUBLIC_CODA_API_TOKEN in your .env file.');
          setLoading(false);
          return;
        }

        const requestHeaders = {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json',
        };

        const response = await axios.get(apiUrl, {
          headers: requestHeaders,
          timeout: requestTimeout
        });

        setData(response.data);

      } catch (e: any) {
        if (axios.isCancel(e)) {
          setError(`Request to Coda Table API timed out after ${requestTimeout / 1000} seconds (axios).`);
        } else if (e.response) {
          setError(`Server error! Status: ${e.response.status}. Message: ${JSON.stringify(e.response.data)}`);
        } else if (e.request) {
          setError('No response received from Coda Table API (axios).');
        } else {
          setError(`Error: ${e.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render item function for FlatList
  const renderEventCard = ({ item, index }: { item: any, index: number }) => {
    const eventStartDateTimeString = item.values?.['Start'] || item.values?.['c-xM1UXlWtET'];
    const eventDescription = item.values?.['Description'] || item.values?.['c-CuhtPto9h7'];
    const signUpLink = item.values?.['Sign Up Link'] || item.values?.['c-oQ9f2MSLrG'];
    const graphicUrl = item.values?.['GraphicURL'] || item.values?.['c-65xmsGtRJz'];

    let formattedDate = 'Date not available';
    let formattedTime = 'Time not available';

    if (eventStartDateTimeString) {
      try {
        const dateObj = new Date(eventStartDateTimeString);
        if (isNaN(dateObj.getTime())) {
          formattedDate = 'Invalid Date';
          formattedTime = 'Invalid Time';
        } else {
          const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
          formattedDate = dateObj.toLocaleDateString(undefined, dateOptions);

          const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
          formattedTime = dateObj.toLocaleTimeString(undefined, timeOptions);
        }
      } catch (error) {
        formattedDate = 'Error in date';
        formattedTime = 'Error in time';
      }
    }

    const handleSignUp = () => {
      if (signUpLink) {
        Linking.openURL(signUpLink).catch(err => console.error("Couldn't load page", err));
      } else {
        console.warn("Sign Up Link is missing for this event.");
      }
    };

    return (
      <View style={styles.card}>
        {graphicUrl ? (
          <Image 
            source={{ uri: graphicUrl }} 
            style={styles.cardImage} 
            contentFit="cover"
            transition={300}
          />
        ) : null}
        {/* Content wrapper for padding */}
        <View style={styles.cardContent}>
          {/* Event Name (cardTitle) is removed */}
          <View style={styles.dateTimeContainer}>
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color={styles.iconStyle.color} style={styles.iconStyle} />
            <ThemedText style={styles.cardText}>Date: {formattedDate}</ThemedText>
          </View>
          <View style={styles.dateTimeContainer}>
            <MaterialCommunityIcons name="clock-time-four-outline" size={18} color={styles.iconStyle.color} style={styles.iconStyle} />
            <ThemedText style={styles.cardText}>Time: {formattedTime}</ThemedText>
          </View>
          {eventDescription ? (
            <ThemedText style={styles.cardText} numberOfLines={3} ellipsizeMode="tail">{eventDescription}</ThemedText>
          ) : null}
          {signUpLink ? (
            <Pressable style={styles.signUpButton} onPress={handleSignUp}>
              <ThemedText style={styles.signUpButtonText}>Sign Up</ThemedText>
            </Pressable>
          ) : (
            <ThemedText style={styles.cardText}>(No sign-up link provided)</ThemedText>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/both-w.png')} style={styles.logo} contentFit="contain" />
          <ThemedText type="title" style={styles.headerTitle}>Actions & Events</ThemedText>
        </View>
        <ThemedText>Loading event data from Coda...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/both-w.png')} style={styles.logo} contentFit="contain" />
          <ThemedText type="title" style={styles.headerTitle}>Actions & Events</ThemedText>
        </View>
        <ThemedText style={{ color: 'red' }}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/both-w.png')} style={styles.logo} contentFit="contain" />
        <ThemedText type="title" style={styles.headerTitle}>Actions & Events</ThemedText>
      </View>
      {data && data.items && data.items.length > 0 ? (
        <FlatList
          data={data.items}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id || item.href || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <ThemedText>No events found.</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50, // Increased top padding, aware of Android status bar
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 80,
    marginBottom: 5, // Reduced space between logo and title
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Increased padding at the bottom of the list
  },
  card: {
    backgroundColor: '#2C2C2E',
    marginBottom: 24, // Increased from 16 to 24
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    marginBottom: 10, // Space between image and title
  },
  cardContent: {
    padding: 18, // Increased from 12 to 18
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Keep similar spacing as individual cardText items
  },
  iconStyle: {
    marginRight: 6,
    color: '#C5C5C7', // Light gray for dark mode, adjust as needed for ThemedText consistency
  },
  cardText: {
    fontSize: 16,
    flexShrink: 1, // Allows text to shrink if container is too small (e.g. very long date string)
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
