import { _decorator, Component, Animation, Sprite, UITransform, animation, AnimationClip, SpriteFrame } from 'cc'
import { CONTROLLER_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import ResourceManager from '../../Runtime/ResourceManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { PlayerStateMachine } from './PlayerStateMachine'
const { ccclass, property } = _decorator

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    private readonly speed = 1 / 10
    x: number = 0
    y: number = 0
    targetX: number = 0
    targetY: number = 0
    isMoving = false
    fsm: PlayerStateMachine

    async init() {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        this.fsm = this.addComponent(PlayerStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        this.fsm.setParams(PARAMS_NAME_ENUM.IDLE, true)

        EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
    }

    // async render() {
    //     const sprite = this.addComponent(Sprite)
    //     sprite.sizeMode = Sprite.SizeMode.CUSTOM
    //     const transform = this.getComponent(UITransform)
    //     transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

    //     const spriteFrames = await ResourceManager.Instance.loadDir('texture/player/idle/top')
    //     const animationComponent = this.addComponent(Animation)

    //     const animationClip = new AnimationClip()

    //     const track = new animation.ObjectTrack() // 创建一个对象轨道
    //     track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')
    //     const frames: Array<[number, SpriteFrame]> = spriteFrames.map((item, index) => [ANIMATION_SPEED * index, item])
    //     // 添加关键帧
    //     track.channel.curve.assignSorted(frames)
    //     // 最后将轨道添加到动画剪辑以应用
    //     animationClip.addTrack(track)

    //     animationClip.duration = frames.length * ANIMATION_SPEED //整个动画剪辑的周期
    //     animationClip.wrapMode = AnimationClip.WrapMode.Loop
    //     animationComponent.defaultClip = animationClip
    //     animationComponent.play()
    // }

    update() {
        this.updateXY()
        this.node.setPosition(this.x * TILE_WIDTH - 1.5 * TILE_WIDTH, 1.5 * TILE_HEIGHT - this.y * TILE_HEIGHT)
    }

    updateXY() {
        //逼近targetX
        if (this.targetX < this.x) {
            this.x -= this.speed
        } else if (this.targetX > this.x) {
            this.x += this.speed
        }

        //逼近targetY
        if (this.targetY < this.y) {
            this.y -= this.speed
        } else if (this.targetY > this.y) {
            this.y += this.speed
        }

        //两者近似就触发结束
        if (Math.abs(this.targetX - this.x) < 0.01 && Math.abs(this.targetY - this.y) < 0.01 && this.isMoving) {
            this.x = this.targetX
            this.y = this.targetY
            this.isMoving = false
            EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
        }
    }

    move(inputDirection: CONTROLLER_ENUM) {
        if (inputDirection === CONTROLLER_ENUM.TOP) {
            this.targetY -= 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
            this.targetY += 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
            this.targetX -= 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
            this.targetX += 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
            this.fsm.setParams(PARAMS_NAME_ENUM.TURNLEFT, true)
        }
    }
}
