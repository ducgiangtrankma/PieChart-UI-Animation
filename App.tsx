/* eslint-disable react-native/no-inline-styles */
import React, {FC, useRef} from 'react';
import {
  SafeAreaView,
  Text,
  Platform,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
} from 'react-native';
import Svg from 'react-native-svg';
import {VictoryPie} from 'victory-native';
import icons from './src/icons';
interface AppProps {}
const {width, height} = Dimensions.get('screen');
export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  padding2: 36,

  // font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 20,
  body3: 16,
  body4: 14,

  // app dimensions
  width,
  height,
};
const App: FC<AppProps> = () => {
  const [categories, setCategories] = React.useState(categoriesData);
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
  const [showMoreToggle, setShowMoreToggle] = React.useState(false);
  const categoryListHeightAnimationValue = useRef(
    new Animated.Value(115),
  ).current;
  const processCategoryDataToDisplay = () => {
    let chartData = categories.map(item => {
      let confirmExpenses = item.expenses.filter(a => a.status === 'C');
      let total = confirmExpenses.reduce((a, b) => a + (b.total || 0), 0);
      console.log('Debug 2----', total);
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
    console.log('Data check', filterChartData);
    // Calculate the total expenses
    let totalExpense = filterChartData.reduce((a, b) => a + (b.y || 0), 0);
    console.log('Total', totalExpense);
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
  const setSelectCategoryByName = (name: any) => {
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

    console.log('Check Chart');
    console.log(chartData);
    if (Platform.OS === 'ios') {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <VictoryPie
            data={chartData}
            labels={datum => `${datum.y}`}
            radius={({datum}) =>
              selectedCategory && selectedCategory.name == datum.name
                ? SIZES.width * 0.4
                : SIZES.width * 0.4 - 10
            }
            innerRadius={70}
            labelRadius={({innerRadius}) =>
              (SIZES.width * 0.4 + innerRadius) / 2.5
            }
            style={{
              labels: {fill: 'white', fontSize: SIZES.body3, lineHeight: 22},
              parent: {
                ...styles.shadow,
              },
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

          <View style={{position: 'absolute', top: '42%', left: '42%'}}>
            <Text style={{fontSize: SIZES.h1, textAlign: 'center'}}>
              {totalExpenseCount - 1}
            </Text>
            <Text style={{fontSize: SIZES.h3, textAlign: 'center'}}>
              Chi phí
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Svg
            width={SIZES.width}
            height={SIZES.width}
            style={{width: '100%', height: 'auto'}}>
            <VictoryPie
              standalone={false} // Android workaround
              data={chartData}
              labels={datum => `${datum.y}`}
              radius={({datum}) =>
                selectedCategory && selectedCategory.name == datum.name
                  ? SIZES.width * 0.4
                  : SIZES.width * 0.4 - 10
              }
              innerRadius={70}
              labelRadius={({innerRadius}) =>
                (SIZES.width * 0.4 + innerRadius) / 2.5
              }
              style={{
                labels: {fill: 'white', fontSize: SIZES.h3},
                parent: {
                  ...styles.shadow,
                },
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
          <View style={{position: 'absolute', top: '42%', left: '42%'}}>
            <Text style={{fontSize: SIZES.h1, textAlign: 'center'}}>
              {totalExpenseCount - 1}
            </Text>
            <Text style={{fontSize: SIZES.h3, textAlign: 'center'}}>
              Chi phí
            </Text>
          </View>
        </View>
      );
    }
  };
  const renderCategoryList = () => {
    const renderItem = ({item}: {item: any}) => (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        style={{
          flex: 1,
          flexDirection: 'row',
          margin: 5,
          paddingVertical: SIZES.radius,
          paddingHorizontal: SIZES.padding,
          borderRadius: 5,
          backgroundColor: COLORS.white,
          ...styles.shadow,
        }}>
        <Image
          source={item.icon}
          style={{
            width: 20,
            height: 20,
            tintColor: item.color,
          }}
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
            data={categories}
            renderItem={renderItem}
            keyExtractor={item => `${item.id}`}
            numColumns={2}
          />
        </Animated.View>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            marginVertical: SIZES.base,
            justifyContent: 'center',
          }}
          onPress={() => {
            if (showMoreToggle) {
              Animated.timing(categoryListHeightAnimationValue, {
                toValue: 115,
                duration: 500,
                useNativeDriver: false,
              }).start();
            } else {
              Animated.timing(categoryListHeightAnimationValue, {
                toValue: 172.5,
                duration: 500,
                useNativeDriver: false,
              }).start();
            }

            setShowMoreToggle(!showMoreToggle);
          }}>
          <Text style={{fontSize: SIZES.h4}}>
            {showMoreToggle ? 'Thu gọn' : 'Mở rộng'}
          </Text>
          <Image
            source={showMoreToggle ? icons.up_arrow : icons.down_arrow}
            style={{marginLeft: 5, width: 15, height: 15, alignSelf: 'center'}}
          />
        </TouchableOpacity>
      </View>
    );
  };
  const renderExpenseSummary = () => {
    let data = processCategoryDataToDisplay();
    console.log('Data-------', data);
    const renderItem = ({item}: {item: any}) => (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          height: 40,
          paddingHorizontal: SIZES.radius,
          borderRadius: 10,
          backgroundColor:
            selectedCategory && selectedCategory.name === item.name
              ? item.color
              : COLORS.white,
        }}
        onPress={() => {
          let categoryName = item.name;
          setSelectCategoryByName(categoryName);
        }}>
        {/* Name/Category */}
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor:
                selectedCategory && selectedCategory.name === item.name
                  ? COLORS.white
                  : item.color,
              borderRadius: 5,
            }}
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
        <View style={{justifyContent: 'center'}}>
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
});
export default App;
const COLORS = {
  // base colors
  primary: '#194868', // Dark Blue
  secondary: '#FF615F', // peach

  // colors
  black: '#1E1F20',
  white: '#FFFFFF',
  lightGray: '#F5F7F9',
  lightGray2: '#FAFBFD',
  gray: '#BEC1D2',
  blue: '#42B0FF',
  darkgray: '#898C95',
  yellow: '#FFD573',
  lightBlue: '#95A9B8',
  darkgreen: '#008159',
  peach: '#FF615F',
  purple: '#8e44ad',
  red: '#FF0000',
};
const confirmStatus = 'C';
const pendingStatus = 'P';
const categoriesData = [
  {
    id: 1,
    name: 'Học tập',
    icon: icons.education,
    color: COLORS.yellow,
    expenses: [
      {
        id: 1,
        title: 'Tuition Fee',
        description: 'Tuition fee',
        location: "ByProgrammers' tuition center",
        total: 100.0,
        status: pendingStatus,
      },
      {
        id: 2,
        title: 'Arduino',
        description: 'Hardward',
        location: "ByProgrammers' tuition center",
        total: 30.0,
        status: pendingStatus,
      },
      {
        id: 3,
        title: 'Javascript Books',
        description: 'Javascript books',
        location: "ByProgrammers' Book Store",
        total: 20.0,
        status: confirmStatus,
      },
      {
        id: 4,
        title: 'PHP Books',
        description: 'PHP books',
        location: "ByProgrammers' Book Store",
        total: 20.0,
        status: confirmStatus,
      },
    ],
  },
  {
    id: 2,
    name: 'Dinh dưỡng',
    icon: icons.food,
    color: COLORS.lightBlue,
    expenses: [
      {
        id: 5,
        title: 'Vitamins',
        description: 'Vitamin',
        location: "ByProgrammers' Pharmacy",
        total: 25.0,
        status: pendingStatus,
      },

      {
        id: 6,
        title: 'Protein powder',
        description: 'Protein',
        location: "ByProgrammers' Pharmacy",
        total: 50.0,
        status: confirmStatus,
      },
    ],
  },
  {
    id: 3,
    name: 'Thư giãn',
    icon: icons.baby_car,
    color: COLORS.darkgreen,
    expenses: [
      {
        id: 7,
        title: 'Toys',
        description: 'toys',
        location: "ByProgrammers' Toy Store",
        total: 25.0,
        status: confirmStatus,
      },
      {
        id: 8,
        title: 'Baby Car Seat',
        description: 'Baby Car Seat',
        location: "ByProgrammers' Baby Care Store",
        total: 100.0,
        status: pendingStatus,
      },
      {
        id: 9,
        title: 'Pampers',
        description: 'Pampers',
        location: "ByProgrammers' Supermarket",
        total: 100.0,
        status: pendingStatus,
      },
      {
        id: 10,
        title: 'Baby T-Shirt',
        description: 'T-Shirt',
        location: "ByProgrammers' Fashion Store",
        total: 20.0,
        status: pendingStatus,
      },
    ],
  },
  {
    id: 4,
    name: 'Làm đẹp',
    icon: icons.healthcare,
    color: COLORS.peach,
    expenses: [
      {
        id: 11,
        title: 'Skin Care product',
        description: 'skin care',
        location: "ByProgrammers' Pharmacy",
        total: 10.0,
        status: pendingStatus,
      },
      {
        id: 12,
        title: 'Lotion',
        description: 'Lotion',
        location: "ByProgrammers' Pharmacy",
        total: 50.0,
        status: confirmStatus,
      },
      {
        id: 13,
        title: 'Face Mask',
        description: 'Face Mask',
        location: "ByProgrammers' Pharmacy",
        total: 50.0,
        status: pendingStatus,
      },
      {
        id: 14,
        title: 'Sunscreen cream',
        description: 'Sunscreen cream',
        location: "ByProgrammers' Pharmacy",
        total: 50.0,
        status: pendingStatus,
      },
    ],
  },
  {
    id: 5,
    name: 'Thể thao',
    icon: icons.sports_icon,
    color: COLORS.purple,
    expenses: [
      {
        id: 15,
        title: 'Gym Membership',
        description: 'Monthly Fee',
        location: "ByProgrammers' Gym",
        total: 45.0,
        status: pendingStatus,
      },
      {
        id: 16,
        title: 'Gloves',
        description: 'Gym Equipment',
        location: "ByProgrammers' Gym",
        total: 15.0,
        status: confirmStatus,
      },
    ],
  },
  {
    id: 6,
    name: 'Mua sắm',
    icon: icons.cloth_icon,
    color: COLORS.red,
    expenses: [
      {
        id: 17,
        title: 'T-Shirt',
        description: 'Plain Color T-Shirt',
        location: "ByProgrammers' Mall",
        total: 20.0,
        status: pendingStatus,
      },
      {
        id: 18,
        title: 'Jeans',
        description: 'Blue Jeans',
        location: "ByProgrammers' Mall",
        total: 50.0,
        status: confirmStatus,
      },
    ],
  },
];
