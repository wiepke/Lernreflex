let lib = {
  constants: {
    //Blacklist (Da Präfix enthalten)
    prefix_blacklist:{
      analysieren:1
    },
    prefixes:[
      //Präfixe
      'gegenüber',
      'zusammen',
      'heraus',
      'durch',
      'her',
      'auf',
      'aus',
      'ein',
      'vor',
      'dar',
      'ab',
      'an',
      'zu',
    ],
    verbs:[
      //Wissen
      'nennen',
      'aufsagen',
      'aufzählen',
      'aussagen',
      'ausführen',
      'aufführen',
      'ausdrücken',
      'benennen',
      'bezeichnen',
      'erzählen',
      'berichten',
      'beschreiben',
      'aufschreiben',
      'zeichnen',
      'skizzieren',
      'angeben',
      'darstellen',
      'schreiben',
      'schildern',
      //Verständnis
      'interpretieren',
      'erklären',
      'erläutern',
      'formulieren',
      'übertragen',
      'übersetzen',
      'deuten',
      'bestimmen',
      'identifizieren',
      'definieren',
      'darstellen',
      'darlegen',
      'Schlüsse und Folgerungen ziehen',
      'ableiten',
      'demonstrieren',
      'zusammenfassen',
      'herausstellen',
      'präsentieren',
      //Anwendung
      'anwenden',
      'programmieren',
      'erstellen',
      'herstellen',
      'ermitteln',
      'herausfinden',
      'lösen',
      'nutzen',
      'durchführen',
      'errechnen',
      'berechnen',
      'ausfüllen',
      'eintragen',
      'drucken',
      'planen',
      'erarbeiten',
      'verwenden',
      'bearbeiten',
      'speichern',
      'sichern',
      'formatieren',
      'erstellen',
      'gestalten',
      'einrichten',
      'konfigurieren',
      'löschen',
      //Analyse
      'isolieren',
      'auswählen',
      'entnehmen',
      'sortieren',
      'einteilen',
      'einordnen',
      'bestimmen',
      'herausstellen',
      'analysieren',
      'vergleichen',
      'gegenüberstellen',
      'unterscheiden',
      'untersuchen',
      'teste',
      //Synthese
      'entwerfen',
      'zuordnen',
      'verbinden',
      'tabellieren',
      'konzipieren',
      'zusammenstellen',
      'in Beziehung setzen',
      'entwerfen',
      'entwickeln',
      'ableiten',
      'ordnen',
      'beziehen',
      'koordinieren',
      //Bewertung
      'entscheiden',
      'beurteilen',
      'urteilen',
      'bewerten',
      'sortieren',
      'klassifizieren',
      'bestimmen',
      'vergleichen',
      'begründen',
      'auswählen',
      'prüfen',
      'entscheiden',
      'Stellung nehmen',
      'evaluieren',
    ],
    generalCompetenceQuestions: [
      {id:1, text: 'Wie motiviert bist du das Lernziel zu erreichen?', type: 'multiple'},
      {id:2, text: 'Warum möchtest du das Lernziel erreichen?', type: 'free'},
      {id:3, text: 'Wieviel Vorwissen hast du, welches dir zum Erreichen des Ziels dient?', type: 'multiple'},
      {id:4, text: 'Was wird ein Ergebnis deines Lernens sein?', placeholder: 'Aufsatz, Programm, Video, etc.', type: 'free'},
      {id:5, text: 'Wie möchtest du das Lernziel erreichen?', type: 'free'},
      {id:6, text: 'Wen kannst du Fragen, wenn du nicht weiterkommst?', type: 'free'},
      {id:7, text: 'Kannst du einfach im Internet suchen um weiterzukommen?', type: 'multiple'},
    ]},
    functions: {
      ich: (infinitive) => { //Konjugation
        let verb = infinitive;
        let rest = '';
        if(verb.indexOf(' ') > -1) {
          let v = verb.split(' ');
          verb = v.pop();
          rest = ' ' + v.join(' ');
        }
        if(!lib.constants.prefix_blacklist[verb])
        for(var i in lib.constants.prefixes){
          let pre = lib.constants.prefixes[i];
          if(verb.startsWith(pre)) {
            verb = verb.replace(new RegExp(pre), '');
            rest = rest + ' ... ' + pre;
            break;
          }
        }
        if(verb.endsWith('en')) {
          verb = verb.substr(0, verb.length - 1);
        } else if(verb.endsWith('rn')) {
          verb = verb.substr(0, verb.length - 1) + 'e';
        }
        else if(verb.endsWith('eln')) {
          verb = verb.substr(0, verb.length - 3) + 'le';
        }
        return (verb  + rest + '').trim();
      },
      swapKeyVal: (data) => {
        return Object.keys(data).reduce(function(obj,key){
          obj[ data[key] ] = key;
          return obj;
        },{});
      },
      index: (obj,is, value) => {
          if (typeof is == 'string')
              return this.index(obj,is.split('.'), value);
          else if (is.length==1 && value!==undefined)
              return obj[is[0]] = value;
          else if (is.length==0)
              return obj;
          else
              return this.index(obj[is[0]],is.slice(1), value);
      },
      /*
      *
      */
      setObjectValues(obj, searchPath, key, setPath, value){
        if(!Array.isArray(searchPath)) searchPath = searchPath.split('.');
        if(!Array.isArray(setPath)) setPath = setPath.split('.');
        console.log(obj, searchPath, key, setPath, value);
        let current = searchPath.shift();
        let last = current && searchPath.length == 0;
        if(!current) {
          return obj;
        }

        let keys;
        if(current == '{}') {
          keys = Object.keys(obj);
        } else {
          keys = [current];
        }
        let canSet = false;
        let currentSetPath;
        for(var i in keys){
          if(last) {
            if(obj[keys[i]] == key) {
              console.log(keys[i], key);
              if(setPath[0] == '-') {
                console.log(value);
                obj = value;
                break;
              }
              else if(setPath[0] == '--') {
                obj.canSetObjectValues = true;
              }
            }
          } else {
            obj[keys[i]] = this.setObjectValues(obj[keys[i]], searchPath.slice(), key, setPath, value);
            if(obj[keys[i]] && obj[keys[i]].canSetObjectValues) {
              setPath.shift();
              delete obj[keys[i]].canSetObjectValues;
              if(setPath[0] == '--') {
                obj.canSetObjectValues = true;
              } else if(setPath[0]) {
                obj = this.index(obj, setPath.join('.'), value);
              }
            }
          }
        }
        return obj;
      }
    }
  };

  module.exports = lib;