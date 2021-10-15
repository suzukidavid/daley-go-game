import { Application } from '@pixi/app'
import { Text, TextStyle } from '@pixi/text'

import Background from './components/Background'
import Ground from './components/Ground'
import Clouds from './components/Clouds'
import Player from './components/Player'

//import bg from './assets/bg.png'
//import ground from './assets/ground.png'
//import player from './assets/player.png'
//import clouds from './assets/clouds.png'
//console.log( bg )

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const levels = [
  [0.0225, 0.0250], // 0 - Entry
  [0.0250, 0.0275], // 1 - Level I
  [0.0275, 0.0300], // 2 - Level II
  [0.0300, 0.0325], // 3 - Level III
  [0.0325, 0.0350], // 4 - Level IV
  [0.0350, 0.0375], // 5 - Level V
  [0.0370, 0.0400], // 6 - Master
]

const FPS = 60;
const MS = 1000/FPS;
export default class PixiApp extends Application {
    constructor(dom, {race = {}, events = {}} = {}) {
        super({
            width: dom.clientWidth,
            height: dom.clientHeight
        })
        this.events = events;
        this.dom = dom;
        this.steps = race.steps;
        this.format = race.format;
        this.total = this.steps ? this.steps.length-1 : -1;
        dom.appendChild(this.view) // Create Canvas tag in the body

        this.init(race)

        window.addEventListener('resize', this.onResize.bind(this))
    }

    getImage() {
      if ( this.images == null || this.images.length == 0 ) {
        this.images = [];
        for(var i=0;i<8;i++) this.images.push(i);
      }
      var n = Math.floor(this.images.length * Math.random());
      return this.images.splice(n, 1)[0];
    }

    init({
      distance = 1000,
      level
    }) {
        // Load the logo
        this.loader.add('bg', '/assets/bg-run.png')
        this.loader.add('ground', '/assets/line.png')
        //this.loader.add('player', player)
        for(var i=0; i<8; i++) {
          this.loader.add('player'+(i+1), '/assets/h'+(i+1)+'.png');
        }
        //this.loader.add('clouds', clouds)
        this.textures = [];

        this.loader.load(this.draw.bind(this))
        this.started = false;
        this.pxPerM = 10;
        this.distance = distance;
        this.time = 0;
        this.frame = 0;
        this.players = [];
        this.place = [];
        this.level = level !== undefined ? level : this.generateLevel();
        
        for(var i=0; i<12; i++) {
          this.players.push({
            slot: i,
            speed: this.generateSpeed(i,0),
            py: i/12,
            image: this.getImage(),
          })
        }
    }

    kill() {
      this.started = false;
      this.destroy(true, true);
    }

    startRace() {
      for(var i=0; i<12; i++) {
        var player = this.players[i].object;
        player.startRace();
      }
      this.started = true;
    }

    timeInfoText() {
      return `Time: ${(this.time/1000).toFixed(0)} (${this.ticker.FPS.toFixed(0)}FPS)`;
    }

    generateLevel() {
      return Math.floor(Math.random() * levels.length);
    }
    generateSpeed(slot, tm) {
      if ( this.format == 1 ) {
        return 0; // No need speed for format 1!
      }
      if ( slot === undefined ) {
        var level = levels[this.level];
        return getRandomArbitrary(level[0], level[1]);
      }
      while (tm > this.steps[this.frame][0]) {
        this.frame++;
      }
      var speed = this.steps[this.frame][1][slot][1];
      return speed;
    }

    resetRace() {
      this.place = [];
      this.started = false;
      this.time = 0;
      this.frame = 0;
      //this.images = [];
      //this.level = this.generateLevel();
      for(var i=0; i<12; i++) {
        var player = this.players[i].object;
        player.speed = this.generateSpeed(i, 0);
        //player.image = this.getImage();
        player.reset();
        //console.log(i, this.players[i]);
      }
      this.ground.onUpdate(0, 0)
      this.timeInfo.text = this.timeInfoText();
    }

    onComplete(slot, time) {
      console.log('onComplete', slot, time)
      this.place.push(slot);
      if ( this.place.length == 12 ) {
        this.started = false;
      }
      return this.place.length;
    }

    draw() {
        this.background = new Background()
        this.ground = new Ground()
        this.timeInfo = new Text(this.timeInfoText(), new TextStyle({fill: '#FFFFFF'}))
        //this.clouds = new Clouds()
        //this.player = new Player('1,', 2.0, 0.3)
        //this.player2 = new Player('2', 3.5, 0.5)

        //this.stage.addChild(this.background, this.ground, this.clouds, this.player)
        //this.stage.addChild(this.background, this.ground, this.player, this.player2, this.timeInfo)
       
        this.stage.addChild(this.background, this.ground, this.timeInfo)
        const onComplete = this.onComplete.bind(this);
        for(var i=0; i<this.players.length; i++) {
          var player = this.players[i];
          //console.log(i, player);
try {          
          player.object = new Player({
            ...player,
            name: String(i+1),
            px: 50,
            distance: this.distance,
            pxPerM: this.pxPerM,
            onComplete: onComplete,
          });
          this.stage.addChild(player.object);
} catch( e ) {
  console.error( e );
}
        }

        this.onResize()
        
        // Create an update loop
        this.ticker.add(this.onUpdate.bind(this))
    }

    onUpdate(delta) {
        //this.time += delta;
        if ( !this.started ) {
          return;
        }

        var dt = this.ticker.elapsedMS;
        this.time += dt;

        if ( this.format == 1 ) {

        } else {
          // Skip frames
          while (this.frame<this.total && this.time > this.steps[this.frame][0]) {
            this.frame++;
          }
        }
        //console.log(this.time, this.frame, this.steps[this.frame][0]);
        var maxX = 0;
        var i;
        for(i=0; i<this.players.length; i++) {
          var player = this.players[i].object;
          if ( this.steps ) {
            if ( this.format == 1 ) {
              var ndx = Math.floor(this.time/MS);
              var pos = ndx < this.steps.length ? this.steps[ndx][i] : this.distance;
              player.onUpdate(dt, pos, this.time, i)
            } else {
              player.speed = this.steps[this.frame][1][i][1];
              player.onUpdate(dt, this.steps[this.frame][1][i][0], this.time, i)
              if ( i == 0 ) {
                //console.log( player.speed, player.pos, player.time );
              }
            }
          } else {
            player.onUpdate(dt)
          }
          if ( player.x > maxX ) {
            maxX = player.x;
          }
        }
        this.frame++;
        if ( maxX > this.lockX ) {
          var dx = this.lockX - maxX;
          for(i=0; i<this.players.length; i++) {
            player = this.players[i].object;
            player.x += dx;
          }
          this.ground.onUpdate(dt, dx)
        }
        this.timeInfo.text = this.timeInfoText();
        if ( this.events.onUpdate ) {
          this.events.onUpdate([...this.players]);
        }
    }

    onResize() {
        this.renderer.resize(this.dom.clientWidth, this.dom.clientHeight)
        const width = this.renderer.width, height = this.renderer.height
        //console.log('Width:', width, 'Height:', height);
        this.lockX = width * 0.8;
        this.background.onResize(width, height)
        this.ground.onResize(width, height)
        //this.clouds.onResize(width, height)
        for(var i=0; i<this.players.length; i++) {
          this.players[i].object.onResize(width, height);
        }
        // this.player.onResize(width, height)
        // this.player2.onResize(width, height)
    }
}