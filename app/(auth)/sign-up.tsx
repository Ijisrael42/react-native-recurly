import { Link } from 'expo-router'
import { Text, View, } from 'react-native'

const SignUp = () => {
    return (
        <View>
            <Text>Sign Up</Text>
            <Link href="/sign-in">Sign In</Link>
        </View>
    )
}

export default SignUp