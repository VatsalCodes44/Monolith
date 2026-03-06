import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.container}>
          <Text style={styles.glitch}>⚠</Text>
          <Text style={styles.title}>SYSTEM FAILURE</Text>
          <View style={styles.divider} />
          <Text style={styles.errorLabel}>// ERROR LOG</Text>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{this.state.error?.message}</Text>
          </View>

          <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonBorder}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.buttonText}>[ REBOOT SYSTEM ]</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  glitch: {
    fontSize: 64,
    color: '#f54444',
    textShadowColor: '#f54444',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  title: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 22,
    color: '#f54444',
    letterSpacing: 4,
    textShadowColor: '#f54444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#2A2A30',
  },
  errorLabel: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 10,
    color: '#3DE3B4',
    letterSpacing: 2,
    alignSelf: 'flex-start',
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#1A1028',
    borderWidth: 1,
    borderColor: '#2A2A30',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Orbitron_900Black',
    letterSpacing: 0.5,
  },
  buttonBorder: {
    borderRadius: 12,
    padding: 2,
    width: '100%',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#0D0D0F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Orbitron_900Black',
    color: '#3DE3B4',
    fontSize: 13,
    letterSpacing: 2,
  },
});