import React, {FC, useRef} from 'react';
import {
  SafeAreaView,
  Text,
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
} from 'react-native';
import Svg from 'react-native-svg';
import {VictoryPie} from 'victory-native';
import icons from './src/icons';
import {COLORS} from './src/colors';
import {categoriesData} from './src/data';
import {SIZES} from './src/constant';
interface AppProps {}
interface Data {
  id: number;
  name: string;
  icon: any;
  color: string;
  expenses: {
    id: number;
    title: string;
    description: string;
    location: string;
    total: number;
    status: string;
  }[];
}

const App: FC<AppProps> = () => {
  const [categories] = React.useState<Data[]>(categoriesData);
  const [selectedCategory, setSelectedCategory] = React.useState<Data>();
  const [showMoreToggle, setShowMoreToggle] = React.useState<boolean>(false);
  const categoryListHeightAnimationValue = useRef(
    new Animated.Value(115),
  ).current;
  const processCategoryDataToDisplay = () => {
    let chartData = categories.map((item: Data) => {
      let confirmExpenses = item.expenses.filter(a => a.status === 'C');
      let total = confirmExpenses.reduce((a, b) => a + (b.total || 0), 0);
      return {
        name: item.name,
        y: total,
        expenseCount: confirmExpenses.length,
        color: item.color,
        id: item.id,
      };
    });

    // filter out categories with no data/expenses
    let filterChartData = chartData.filter(a => a.y > 0);
    // Calculate the total expenses
    let totalExpense = filterChartData.reduce((a, b) => a + (b.y || 0), 0);
    // Calculate percentage and repopulate chart data
    let finalChartData = filterChartData.map(item => {
      let percentage = ((item.y / totalExpense) * 100).toFixed(2);
      return {
        label: `${percentage}%`,
        y: Number(item.y),
        expenseCount: item.expenseCount,
        color: item.color,
        name: item.name,
        id: item.id,
      };
    });

    return finalChartData;
  };
  const setSelectCategoryByName = (name: string) => {
    let category = categories.filter(a => a.name === name);
    setSelectedCategory(category[0]);
  };
  const renderChart = () => {
    let chartData = processCategoryDataToDisplay();
    let colorScales = chartData.map(item => item.color);
    let totalExpenseCount = chartData.reduce(
      (a, b) => a + (b.expenseCount || 0),
      0,
    );
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.viewChart}>
          <VictoryPie
            data={chartData}
            labels={datum => `${datum.y}`}
            radius={({datum}) =>
              selectedCategory && selectedCategory.name === datum.name
                ? SIZES.width * 0.4
                : SIZES.width * 0.4 - 10
            }
            innerRadius={70}
            // labelRadius={({innerRadius}) =>
            //   (SIZES.width * 0.4 + innerRadius) / 2.5
            // }
            labelRadius={(SIZES.width * 0.4 + 70) / 2.5}
            style={{
              labels: {fill: 'white', fontSize: SIZES.body3, lineHeight: 22},
              //Shadow in chart - option
              // parent: {
              //   ...styles.shadow,
              // },
            }}
            width={SIZES.width * 0.8}
            height={SIZES.width * 0.8}
            colorScale={colorScales}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPress: () => {
                    return [
                      {
                        target: 'labels',
                        mutation: props => {
                          let categoryName = chartData[props.index].name;
                          setSelectCategoryByName(categoryName);
                        },
                      },
                    ];
                  },
                },
              },
            ]}
          />

          <View style={styles.centerChart}>
            <Text style={styles.textH1}>{totalExpenseCount - 1}</Text>
            <Text style={styles.textH3}>Expenses</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.viewChart}>
          <Svg
            width={SIZES.width}
            height={SIZES.width}
            style={styles.svgChartAndroid}>
            <VictoryPie
              standalone={false} // Android work around
              data={chartData}
              labels={datum => `${datum.y}`}
              radius={({datum}) =>
                selectedCategory && selectedCategory.name === datum.name
                  ? SIZES.width * 0.4
                  : SIZES.width * 0.4 - 10
              }
              innerRadius={70}
              // labelRadius={({innerRadius}) =>
              //   (SIZES.width * 0.4 + innerRadius) / 2.5
              // }
              labelRadius={(SIZES.width * 0.4 + 70) / 2.5}
              style={{
                labels: {fill: 'white', fontSize: SIZES.h3},
                // parent: {
                //   ...styles.shadow,
                // },
              }}
              width={SIZES.width}
              height={SIZES.width}
              colorScale={colorScales}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onPress: () => {
                      return [
                        {
                          target: 'labels',
                          mutation: props => {
                            let categoryName = chartData[props.index].name;
                            setSelectCategoryByName(categoryName);
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
            />
          </Svg>
          <View style={styles.centerChart}>
            <Text style={styles.textH1}>{totalExpenseCount - 1}</Text>
            <Text style={styles.textH3}>Expenses</Text>
          </View>
        </View>
      );
    }
  };
  const renderCategoryList = () => {
    const renderItem = ({item}: {item: Data}) => (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        style={styles.itemCategory}>
        <Image
          source={item.icon}
          style={[
            styles.icon,
            {
              tintColor: item.color,
            },
          ]}
        />
        <Text
          style={{
            marginLeft: SIZES.base,
            color: COLORS.primary,
            fontSize: SIZES.h4,
          }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
    return (
      <View style={{paddingHorizontal: SIZES.padding - 5}}>
        <Animated.View style={{height: categoryListHeightAnimationValue}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={categories}
            renderItem={renderItem}
            keyExtractor={item => `${item.id}`}
            numColumns={2}
          />
        </Animated.View>

        <TouchableOpacity
          style={styles.buttonShowMore}
          onPress={() => {
            if (showMoreToggle) {
              Animated.timing(categoryListHeightAnimationValue, {
                toValue: 115,
                duration: 300,
                useNativeDriver: false,
              }).start();
            } else {
              Animated.timing(categoryListHeightAnimationValue, {
                toValue: 172.5,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }

            setShowMoreToggle(!showMoreToggle);
          }}>
          <Text style={{fontSize: SIZES.h4}}>
            {showMoreToggle ? 'LESS' : 'MORE'}
          </Text>
          <Image
            source={showMoreToggle ? icons.up_arrow : icons.down_arrow}
            style={styles.iconShowMore}
          />
        </TouchableOpacity>
      </View>
    );
  };
  const renderExpenseSummary = () => {
    let data = processCategoryDataToDisplay();
    const renderItem = ({item}: {item: any}) => (
      <TouchableOpacity
        style={[
          styles.itemListExpenses,
          {
            backgroundColor:
              selectedCategory && selectedCategory.name === item.name
                ? item.color
                : COLORS.white,
          },
        ]}
        onPress={() => {
          let categoryName = item.name;
          setSelectCategoryByName(categoryName);
        }}>
        {/* Name/Category */}
        <View style={styles.base}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  selectedCategory && selectedCategory.name === item.name
                    ? COLORS.white
                    : item.color,
              },
            ]}
          />

          <Text
            style={{
              marginLeft: SIZES.base,
              color:
                selectedCategory && selectedCategory.name === item.name
                  ? COLORS.white
                  : COLORS.primary,
              fontSize: SIZES.h3,
            }}>
            {item.name}
          </Text>
        </View>
        {/* Expenses */}
        <View style={styles.base1}>
          <Text
            style={{
              color:
                selectedCategory && selectedCategory.name === item.name
                  ? COLORS.white
                  : COLORS.primary,
              fontSize: SIZES.h3,
            }}>
            {item.y} USD - {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <View style={{padding: SIZES.padding}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={item => `${item.id}`}
        />
      </View>
    );
  };
  return (
    <SafeAreaView>
      {renderChart()}
      {renderCategoryList()}
      {renderExpenseSummary()}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  viewChart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  base1: {justifyContent: 'center'},
  base2: {
    flexWrap: 'wrap',
  },
  centerChart: {position: 'absolute', top: '42%', left: '42%'},
  textH1: {fontSize: SIZES.h1, textAlign: 'center'},
  textH3: {fontSize: SIZES.h3, textAlign: 'center'},
  svgChartAndroid: {width: '100%', height: 'auto'},
  itemCategory: {
    flex: 1,
    flexDirection: 'row',
    margin: 5,
    paddingVertical: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  icon: {
    width: 20,
    height: 20,
  },
  buttonShowMore: {
    flexDirection: 'row',
    marginVertical: SIZES.base,
    justifyContent: 'center',
  },
  iconShowMore: {marginLeft: 5, width: 15, height: 15, alignSelf: 'center'},
  itemListExpenses: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: SIZES.radius,
    borderRadius: 10,
  },
  dot: {
    borderRadius: 5,
    width: 20,
    height: 20,
  },
});
export default App;
