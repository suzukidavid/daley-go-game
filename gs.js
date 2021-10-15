
class Horse {
  constructor(args) {
    Object.assign(this, args, {
      pos: 0,
      time: 0,
      run: true,
      steps: [],
    })
  }

  update(delta) {
    var dx = this.run ? delta*this.speed : 0.0;
    this.pos += dx;
    if ( this.pos < this.distance ) {
      this.time += delta;
      //this.steps.push([this.time, this.pos, this.speed])
      if ( this.LOG && this.slot == 0 ) console.log('POS', this.time,  this.pos, this.speed, dx, delta);
    } else {
      if ( this.run ) {
        delta = (this.pos - this.distance)/this.speed
        this.time += delta;
        this.pos = this.distance;
        //this.steps.push([this.time, this.pos, this.speed])
        if ( this.LOG && this.slot == 0 ) console.log('POS', this.time,  this.pos, this.speed, dx, delta);
        this.onComplete(this.slot, this.time)
        this.run = false;
      }
      this.pos = this.distance;
    }
  }
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function generateSpeed(race) {
  var level = levels[race.level];
  return getRandomArbitrary(level[0], level[1]);
  //return 0.025 + ((Math.random()-0.5)/200)
}

async function gameServer(options, race) {
  var place = [];
  var started = true;
  const onComplete = (slot, time) => {
    console.log('onComplete', slot, time)
    place.push([slot,time]);
    if ( place.length == 12 ) {
      started = false;
    }
    return place.length;
  }

  var players = [];
  for(var i=0; i<12; i++) {
    players.push(new Horse({
      slot: i,
      speed: generateSpeed(race),
      distance: race.distance,
      onComplete,
    }))
  }
  //console.log( players );

  var steps = [];
  var FPS = 60;
  var time = race.date
  var tm = 0;
  var delta = 1000/FPS;
  var frame = 0;
  while( started ) {
    time += delta;
    tm += delta;
    frame++;
    players.forEach((player,j)=>{
      player.update(delta);
    })
    if ( frame == FPS ) {
      players.forEach(player=>{
        player.speed = generateSpeed(race); // Generate speed event second!
      })
      frame = 0;
    }
    if ( options.format == 1 ) {
      var stepData = players.map(p=>p.pos)
      steps.push(stepData)
    } else {
      var stepData = players.map(p=>[p.pos, p.speed])
      steps.push([tm, stepData])
    }
  }

  // var steps = players.map((p)=>{
  //   return {
  //     slot: p.slot,
  //     steps: p.steps,
  // }})
  //console.log('DATA', steps)

  if ( options.format ) {
    race.format = options.format
  }
  race.place = place;
  race.steps = steps;
}

module.exports = {
  gameServer,
}
