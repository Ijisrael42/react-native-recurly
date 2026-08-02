import SubscriptionCard from '@/components/SubscriptionCard'
import { useSubscriptions } from '@/context/SubscriptionContext'
import { Feather } from '@expo/vector-icons'
import { styled } from 'nativewind'
import React, { useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = styled(RNSafeAreaView)

const Subscriptions = () => {
    const { subscriptions } = useSubscriptions()
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const filteredSubscriptions = subscriptions.filter(
        (subscription) =>
            subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subscription.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <FlatList
                ListHeaderComponent={
                    <View className="mb-4">
                        <Text className="text-3xl font-sans-bold text-primary">
                            Subscriptions
                        </Text>

                        <Text className="text-sm font-sans-medium text-muted-foreground mt-1 mb-5">
                            {filteredSubscriptions.length}{' '}
                            {filteredSubscriptions.length === 1
                                ? 'subscription'
                                : 'subscriptions'}{' '}
                            found
                        </Text>

                        <View className="flex-row items-center rounded-2xl border border-border bg-card px-4 py-3">
                            <Feather
                                name="search"
                                size={20}
                                color="rgba(0,0,0,0.4)"
                            />

                            <TextInput
                                className="flex-1 ml-3 text-base font-sans-medium text-primary p-0"
                                placeholder="Search subscriptions..."
                                placeholderTextColor="rgba(0,0,0,0.4)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                                autoCapitalize="none"
                                returnKeyType="search"
                                clearButtonMode="while-editing"
                            />

                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery('')}
                                    hitSlop={{
                                        top: 10,
                                        bottom: 10,
                                        left: 10,
                                        right: 10,
                                    }}
                                >
                                    <Feather
                                        name="x-circle"
                                        size={18}
                                        color="rgba(0,0,0,0.4)"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                }
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedId === item.id}
                        onPress={() =>
                            setExpandedId(
                                expandedId === item.id ? null : item.id
                            )
                        }
                    />
                )}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                contentContainerClassName="pb-30"
                ListEmptyComponent={
                    <View className="items-center justify-center py-12 px-4 rounded-3xl border border-dashed border-border bg-card/50">
                        <View className="size-14 items-center justify-center rounded-full bg-muted mb-3">
                            <Feather
                                name="search"
                                size={24}
                                color="rgba(0,0,0,0.4)"
                            />
                        </View>

                        <Text className="text-lg font-sans-bold text-primary text-center">
                            No subscriptions found
                        </Text>

                        <Text className="text-sm font-sans-medium text-muted-foreground text-center mt-1">
                            {searchQuery
                                ? `No subscription matches "${searchQuery}".`
                                : 'You have no subscriptions added yet.'}
                        </Text>

                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                className="mt-4 rounded-full border border-border bg-background px-4 py-2"
                                onPress={() => setSearchQuery('')}
                            >
                                <Text className="text-sm font-sans-semibold text-primary">
                                    Clear Search
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default Subscriptions