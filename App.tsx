import React, {FC} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {VictoryBar} from 'victory-native';
interface AppProps {}
const App: FC<AppProps> = () => {
  return (
    <SafeAreaView>
      <Text>TEST</Text>
      <VictoryBar />
    </SafeAreaView>
  );
};
export default App;
