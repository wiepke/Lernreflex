'use strict'
import {
  Platform,
  AsyncStorage
} from 'react-native';
import ip from 'Lernreflex/localip';
import lib from 'Lernreflex/lib';

class Model {
  constructor(className, caching = true){
    this.protocol = 'http://';
    if(Platform.OS === 'ios') {
      this.ip = ip.ip ? ip.ip : 'localhost'
    } else {
      this.ip = ip.ip ? ip.ip : 'localhost';
    }
    this.host = this.protocol + this.ip+':8084/';
    this.api1 = this.host+'api1/';
    this.api0 = this.host+'competences/';
    this.api = this.api1;
    this.headers = {
      'Accept' : 'application/json',
      //'Content-Type' : 'application/json',
      //'Host' : this.host
    };
    this.putHeaders = {
      //'Accept' : 'text/plain',
      'Content-Type' : 'application/json', //Muss gesetzt sein!
      //'Host' : this.host
    };
    this.className = className; //Dont use this.constructor.name because it will be something else when building
    this.definition = false;
    this.caching = caching;
    this.prefix = 'lernreflex_'; //Prefix for AsyncStorage
    this.cache_time = 3600; //In seconds
  }

  setApi(num){
    if(num == 0){
      this.api = this.api0;
    }
    if(num == 1){
      this.api = this.api1;
    }
  }

  put(url, body){
    let req = {
      method: 'PUT',
      headers: this.putHeaders,
      body: JSON.stringify(body)//.replace(/\\/,'')
    }
    return this.fetch(url, req);
  }

  get(url, params){
    let req = {
      method: 'GET',
      headers: this.headers
    }
    var lim = '?';
    var nocache;
    if(params){
      if(params.nocache){
        nocache = true;
        delete params.nocache;
      }
      Object.keys(params).forEach(key => {
        url += lim+key +'=' + encodeURIComponent(params[key]);
        lim = '&';
      });
    }
    //alert(url);
    //return Promise.resolve();
    return this.fetch(url, req, nocache);
  }

  post(url, body){
    let req = {
      method: 'POST',
      headers: this.putHeaders,
      body: JSON.stringify(body)
    }
    return this.fetch(url, req);
  }

  fetch(url, req, nocache){
    url = this.api+url;
    const delay = this.cache_time * 1000; //Abstand zwischen 2 gleichen GET-Requests (Sonst aus Cache)
    var request = this.lastRequest = {url: url, req: req};
    var isGET = req.method.toUpperCase() === 'GET';
    var caching = this.caching && isGET && !nocache;
    var fromCache = false;
    var errorCallback = (d) => {
      console.log('ERROR', d);
    };
    var callback = (response) => {
      var contentType = response.headers ? response.headers.get('content-type') : '';
      //console.log(contentType);
      if(fromCache) {
        //console.log(fromCache);
        return response;
      }
      var processResponse = (d) => {
        if(typeof(d) === 'string' && d.indexOf('Request failed') > -1)
        throw 'Grizzly request failed.';
        if(isGET){ //
          if(Array.isArray(d)) {
            d = d.map((e) => {e.requestSourceUrl = url; return e});
          } else if(typeof(d) == 'object') {
            d.requestSourceUrl = url;
          }
          return this.setItem(request.url, d, true).then(() => d);
        }
        return d;
      };
      if(contentType && contentType.indexOf('application/json') !== -1) {
        return response.text().then((d) => {
          try {
            //console.log('parsed JSON');
            return processResponse(JSON.parse(d));
          } catch (e) {
            console.log('parsed Error' + d);
            return processResponse(d);
          }
        }, errorCallback);
      } else {
        return response.text().then(processResponse, errorCallback);
      }
    }
    //caching = false;
    if(caching){
      return this.getItem(request.url, false, false, true)
      .then((d) => {
        //console.log(d, Date.now(), delay, Date.now() - d);
        fromCache = d && Date.now() - d < delay;
        return fromCache ? this.getItem(request.url, false): fetch(url, req)
      })
      .then(callback, errorCallback);
    }
    //console.log(url);
    //console.log(req);
    var requestObject = new Request(url, req);
    console.log(requestObject);
    return fetch(requestObject).then(callback, errorCallback);
  }

  delete(url){

  }

  checkDefinition(obj){
    if(!this.definition) return obj;
    var error = [];
    Object.keys(this.definition).map((def) => {
      if(this.definition[def] == '*' && !obj[def]){
        error.push(def);
      }
    });
    Object.keys(obj).map((def) => {
      if(!this.definition[def]){
        delete obj[def];
      }
    });
    if(error.length > 0)
    throw 'Properties missing in ' + this.className + ': ' + error.join(', ');
    return obj;
  }

  save(key, value){
    this.setItem(key, value);
  }

  getName(key, name){
    name = name ? name : this.className;
    return this.prefix + name + '_' + key;
  }

  setItem(key, value, time){
    //console.log('KEYNAME:', this.getName(key));
    return AsyncStorage.setItem(this.getName(key), JSON.stringify(value)).then((d) => {
      if(time)
      return AsyncStorage.setItem(this.getName(key)+'_time', Date.now().toString());
      return d;
    })
  }
  /*
  *
  */
  getItem(key, defaultValue, name, time){
    time = time ? '_time' : '';
    return AsyncStorage.getItem(this.getName(key, name)+time).then((value) => { return value ? JSON.parse(value) : defaultValue; });
    //item ? JSON.parse(item) : defaultValue;
  }
  getAllKeys(){
    return AsyncStorage.getAllKeys().then((keys) => keys.filter((k) => k.startsWith(this.prefix)));
  }

  clearStorage(){
    return this.getAllKeys().then((keys) => AsyncStorage.multiRemove(keys));
  }

  mapToNumericalKeys(obj){
    return Object.keys(obj).map(key => obj[key]);
  }

  removeLocal(key){
    return AsyncStorage.removeItem(this.getName(key));
  }

  log(d){
    console.log(d);
    return d;
  }

  clearCache(){

  }

  isLoggedIn(){
    return this.getItem('auth', false, 'User');
  }

  setState(key, value){
    let _this = this;
    return this.getItem('changes', {}).then((changes) => {
      if(!changes) changes = {};
      return _this.setItem(key, value).then(() => {
        //changes = {};
        changes[key] = key;
        console.log('SettingChanges:', changes);
        return _this.setItem('changes', changes);//.then(() => this.getItem('changes')).then((value) => console.log('Saved?', value));
      });
    });
  }


  mayApplyLocalChanges(list, searchPath, setPath, valueCallback){
    let count = 0;
    return this.getItem('changes', false).then((changes) => {
      if(!changes || !list || !Object.keys(changes).length) return false;
      let promises = [];
      let keys = [];
      for(var i in changes){
        keys.push(i);
        promises.push(this.getItem(changes[i]));
      }
      return Promise.all(promises).then((values) => {
        console.log(values, list);
        for(var i in values) {
          if(values[i]) {
            let v = valueCallback ? valueCallback(values[i]) : values[i];
            list = lib.functions.setObjectValues(list, searchPath, changes[keys[i]], setPath, v);
          }
        }
        console.log(list);
        return list;
      }).then((list) => {
        return this.setItem('changes', false).then(() => list);
      });
    });
    /*return this.getItem('changes', false).then((changes) => {
      //console.log('CHANGES', changes, list);
      if(!changes || !list || !Object.keys(changes).length) return false;
      let promises = [];
      Object.keys(list).map((key) => {
        let name = list[key][property];
        if(changes[name]) {
          console.log(list[key][property]);
          promises.push(this.getItem(changes[name]).then((value) => {
            list[key] = value;
            console.log(value);
            delete changes[name];
            return this.setItem('changes', changes);
          }));
        }
      });
      if(promises.length) {
        return Promise.all(promises).then(() => {
          //console.log(list);
          return list;
        });
      }
      return false;
    });*/
  }
}

module.exports = Model;
