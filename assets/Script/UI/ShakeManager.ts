import { _decorator, Component, Node, Event, game } from 'cc'
import { CONTROLLER_ENUM, EVENT_ENUM, SHAKE_TYPE_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
const { ccclass, property } = _decorator

@ccclass('ShakeManager')
export class ShakeManager extends Component {
    private isShaking: boolean = false
    private shakeType: SHAKE_TYPE_ENUM = SHAKE_TYPE_ENUM.TOP
    private oldTime: number = 0
    private oldPos: { x: number; y: number } = { x: 0, y: 0 }

    onLoad() {
        EventManager.Instance.on(EVENT_ENUM.SCREEN_SHAKE, this.onShake, this)
    }

    onDestroy() {
        EventManager.Instance.off(EVENT_ENUM.SCREEN_SHAKE, this.onShake)
    }

    update() {
        this.onShakeUpdate()
    }

    stop() {
        this.isShaking = false
    }

    onShake(type: SHAKE_TYPE_ENUM) {
        if (this.isShaking) {
            return
        }
        this.isShaking = true
        this.shakeType = type
        this.oldTime = game.totalTime
        this.oldPos.x = this.node.position.x
        this.oldPos.y = this.node.position.y
    }

    /***
     * 正弦震动
     * y= A * sin *(wx + f)
     */
    onShakeUpdate() {
        if (this.isShaking) {
            //振幅
            const shakeAmount = 1.6
            //持续时间
            const duration = 200
            //频率
            const frequency = 12
            //当前时间
            const curSecond = (game.totalTime - this.oldTime) / 1000
            //总时间
            const totalSecond = duration / 1000
            const offset = shakeAmount * Math.sin(frequency * Math.PI * curSecond)
            if (this.shakeType === SHAKE_TYPE_ENUM.TOP) {
                this.node.setPosition(this.oldPos.x, this.oldPos.y - offset)
            } else if (this.shakeType === SHAKE_TYPE_ENUM.BOTTOM) {
                this.node.setPosition(this.oldPos.x, this.oldPos.y + offset)
            } else if (this.shakeType === SHAKE_TYPE_ENUM.LEFT) {
                this.node.setPosition(this.oldPos.x - offset, this.oldPos.y)
            } else if (this.shakeType === SHAKE_TYPE_ENUM.RIGHT) {
                this.node.setPosition(this.oldPos.x + offset, this.oldPos.y)
            }
            if (curSecond > totalSecond) {
                this.isShaking = false
                this.node.setPosition(this.oldPos.x, this.oldPos.y)
            }
        }
    }
}
