import { useAuth, useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import { posthog } from '@/lib/posthog'
import images from '@/constants/images'
import { styled } from 'nativewind'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = styled(RNSafeAreaView)

const SettingsOption = ({ 
  icon, 
  title, 
  subtitle 
}: { 
  icon: keyof typeof Feather.glyphMap; 
  title: string; 
  subtitle?: string; 
}) => {
  return (
    <TouchableOpacity 
      className="flex-row items-center justify-between border-b border-border py-4"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="size-10 items-center justify-center rounded-xl bg-primary/5">
          <Feather name={icon} size={20} color="#081126" />
        </View>
        <View>
          <Text className="text-base font-sans-semibold text-primary">{title}</Text>
          {subtitle ? (
            <Text className="text-xs font-sans-medium text-muted-foreground">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color="rgba(0, 0, 0, 0.4)" />
    </TouchableOpacity>
  )
}

const Settings = () => {
    const { signOut } = useAuth()
    const { user } = useUser()

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Log Out', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            posthog?.capture('logout_completed')
                            posthog?.reset()
                            await signOut()
                        } catch (error) {
                            console.error('Error signing out:', error)
                        }
                    }
                }
            ]
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView 
                contentContainerClassName="px-5 pb-30 pt-2"
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>

                {/* User Card */}
                <View className="mb-6 rounded-3xl border border-border bg-card p-5 flex-row items-center gap-4">
                    <Image 
                        source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                        className="size-16 rounded-full border border-border" 
                    />
                    <View className="flex-1">
                        <Text className="text-xl font-sans-bold text-primary">
                            {user?.fullName || user?.firstName || 'User'}
                        </Text>
                        {user?.primaryEmailAddress?.emailAddress ? (
                            <Text className="text-sm font-sans-medium text-muted-foreground mt-0.5">
                                {user.primaryEmailAddress.emailAddress}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Settings Options Group 1 */}
                <View className="mb-6 rounded-3xl border border-border bg-card px-5">
                    <SettingsOption 
                        icon="user" 
                        title="Account Information" 
                        subtitle="Name, Email, Personal Details"
                    />
                    <SettingsOption 
                        icon="bell" 
                        title="Notifications" 
                        subtitle="Alerts, renewal reminders"
                    />
                    <SettingsOption 
                        icon="credit-card" 
                        title="Payment Methods" 
                        subtitle="Linked cards, billing history"
                    />
                    <SettingsOption 
                        icon="shield" 
                        title="Security" 
                        subtitle="Change password, 2FA"
                    />
                </View>

                {/* Settings Options Group 2 */}
                <View className="mb-6 rounded-3xl border border-border bg-card px-5">
                    <SettingsOption 
                        icon="help-circle" 
                        title="Help & Support" 
                    />
                    <SettingsOption 
                        icon="info" 
                        title="About Recurly" 
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                    onPress={handleLogout}
                    className="items-center justify-center rounded-2xl bg-destructive py-4 flex-row gap-2"
                    activeOpacity={0.8}
                >
                    <Feather name="log-out" size={18} color="#fff" />
                    <Text className="text-base font-sans-bold text-white">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Settings