'use strict'
import React from 'react';

/**
* Provides functions for routing in a navigator and contains some of the app's global variables
* @class Router
*/
var Router = {
  systemName: 'Lernreflex',
  adminNames: ['mkapp', 'admin', 'teacher'],
  icons: {
    goals:'ios-pie-outline',
    badges:'md-ribbon',
    notifications:'md-notifications',
    competences:'md-school',
    menu:'md-menu',
    community:'ios-contacts',
    person:'ios-person',
    addRound:'ios-add-circle',
    comments:'ios-chatboxes',
  },

  /**
  * Route to a new view
  * @param route {object} Contains component class and props for target view.
  * @param navigator {ReactNative.Navigator|ReactNative.NavigatorIOS}
  * @param params {object} Object with params to change the routing function (see bottom of this function for use)
  */
  route(route, navigator, params){
    if(!route.passProps){
      route.passProps = {};
    }
    switch (route.id) {
      case 'goals':
      route.passProps = {...route.passProps, type:'goals'};
      route.title = 'Lernziele';
      break;
      case 'competences':
      route.passProps = {...route.passProps, type:'competences'};
      route.title = 'Kompetenzen';
      break;
      case 'questions':
      route.passProps = {...route.passProps};
      route.title = 'Reflexionsfragen';
      break;
      case 'goal':
      route.passProps = {...route.passProps, type:'goals'};
      route.title = 'Lernziel';
      break;
      case 'competence':
      route.passProps = {...route.passProps, type:'competences'};
      route.title = 'Kompetenz';
      break;
      case 'goal.add':
      route.title = 'Lernziel erstellen';
      route.passProps = {...route.passProps, type: 'goals', inputTitle:'Lernziel eingeben'};
      break;
      case 'competence.add':
      route.title = 'Kompetenz hinzufügen';
      route.passProps = {...route.passProps, type: 'competences', inputTitle:'Kompetenz eingeben'};
      break;
      case 'user.login':
      if(!route.title) route.title = 'Einloggen';
      break;
      case 'users':
      route.title = 'Mitlerner';
      break;
      case 'menu':
      route.title = 'Menü';
      break;
      case 'notifications':
      route.title = 'Benachrichtigungen';
      break;
      case 'badges':
      route.title = 'Abzeichen'; //'Badges';
      break;
      case 'admin':
      route.title = 'Admin';
      break;
      case 'select':
      route.leftButtonTitle = 'Abbrechen';
      route.onLeftButtonPress = () => {navigator.pop()};
      break;
    }
    console.log(route);
    if(!navigator){
      return route;
    }
    if(!params){
      navigator.push(route);
    } else {
      if(params.replace)
      navigator.replace(route);
      if(params.reset)
      navigator.resetTo(route);
      if(params.replacePrevious) {
        navigator.replacePreviousAndPop(route);
      }
    }
  },
  /**
  * Render the route.component
  * @param route {object} Contains component class and props for target view.
  * @param navigator {ReactNative.Navigator|ReactNative.NavigatorIOS}
  */
  renderRoute(route, navigator){
    route = this.route(route);
    return (<route.component navigator={navigator} route={route} title={route.title} {...route.passProps} />);
  },

}

module.exports = Router;
