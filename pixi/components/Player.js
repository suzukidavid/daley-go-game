import { Texture } from '@pixi/core'
import { Sprite } from '@pixi/sprite'
import { Text, TextStyle } from '@pixi/text'
import anime from 'animejs'

export default class Background extends Sprite {
    constructor(args) {
        super(Texture.EMPTY)
        //slot, name, px, py, speed, distance, pxPerM, onComplete
        for(var p in args) {
            this[p] = args[p];
        }
        this.pos = 0;
        this.time = 0;
        this.run = false;
        this.place = 12;

        //this.texture = Texture.from('player'+(this.image+1))
        //this.sprite = Sprite.from(this.texture || 'player')
        this.sprite = Sprite.from(Texture.from('player'+(this.image+1)));
        // console.log( 'Size:', this.sprite.width, this.sprite.height )
        this.spriteHeight = this.sprite.height;
        this.sprite.anchor.set(0.5)
        this.addChild(this.sprite)
        // this.sprite.interactive = true;
        // this.sprite.on('pointerdown', (e) => {
        //     if ( e.data.button === 2 ) {
        //         this.speed -= 0.5;
        //     } else {
        //         this.speed += 0.5;
        //     }
        //     console.log('pointerdown', e, e.data.button, e.data.buttons, this.speed, this.pos)
        // })

        this.text = new Text(this.playerInfoText(), new TextStyle({fill: '#FFFFFF'}))
        this.text.anchor.set(0.5);
        this.text.x = -30;
        this.addChild(this.text)

        //this.animate()
    }

    playerInfoText() {
        //return `Player ${this.name} - ${this.pos.toFixed(0)} (${this.time.toFixed(1)})/${(this.speed*1000).toFixed(2)}`
        return this.name;
    }

    reset(w,h) {
        this.pos = 0;
        this.time = 0;
        this.x = this.px;
        //this.initPlayerSprite();
        this.sprite.texture = Texture.from('player'+(this.image+1))
        this.text.text = this.playerInfoText();
        this.run = false;
        this.place = 12;
        //this.onResize(w,h);
    }

    startRace() {
        this.run = true;
    }

    onUpdate(delta, pos, time, slot) {
        if ( pos ) {
            if ( pos > this.pos ) {
                this.pos = pos;
                this.time = time;
            }
            if ( this.pos < this.distance ) {
            } else {
                this.pos = this.distance;
                if ( this.run ) {
                    this.place = this.onComplete(this.slot, this.time)
                    this.run = false;
                }
            }
        } else {
            var dx = this.run ? delta*this.speed : 0.0;
            this.pos += dx;
            if ( this.pos < this.distance ) {
                this.time += (delta/1000);
            } else {
                this.pos = this.distance;
                if ( this.run ) {
                    this.place = this.onComplete(this.slot, this.time)
                    this.run = false;
                }
            }
        }
        this.x = this.px + this.pos * this.pxPerM;
        //console.log(`Player ${this.name}`, pos);
        this.text.text = this.playerInfoText();
    }

    animate() {
        anime({
            targets: this.sprite,
            x: {
                value: 25,
                duration: 2000,
                easing: 'easeInOutCubic'
            },
            loop: true,
            direction: 'alternate'
        })

        anime({
            targets: this.sprite,
            duration: 750,
            y: {
                value: 10,
                easing: 'easeInOutQuad'
            },
            loop: true,
            direction: 'alternate'
        })

        const angle = 0.02
        this.sprite.rotation = angle
        anime({
            targets: this.sprite,
            duration: 1000,
            rotation: {
                value: -angle,
                easing: 'easeInOutQuad'
            },
            loop: true,
            direction: 'alternate'
        })
    }

    onResize(width, height) {
        var h = height * 0.9;
        //this.x = width * 0.1;
        this.x = this.px;
        this.y = height*0.05 + h/24 + h*this.py;
        // console.log('Player ', this.name, this.y );
        var scale = (h/12/this.spriteHeight)*0.9;
        this.sprite.scale.set(scale,scale);
    }
}
