import { StyleSheet } from "react-native";
 const BLUE = "#3872E9";
  const LIGHGREY = "lightgrey";

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#3872E9',
        padding:10,
        margin:10,
        borderRadius:10,
        maxWidth:'75%'
    },
    text:{
        color:'#FFFFFF',
        fontSize:16,
    },
    leftContainer:{
         backgroundColor:  BLUE,
          marginLeft:  10,
          marginRight: "auto",
    },
     rightContainer:{
         backgroundColor:  LIGHGREY,
          marginLeft:  'auto',
          marginRight: 10,
    }
});

export default styles;