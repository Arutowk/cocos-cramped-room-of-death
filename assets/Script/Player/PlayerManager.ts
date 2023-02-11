import { _decorator, Component, Sprite, UITransform } from 'cc'
import {
    CONTROLLER_ENUM,
    DIRECTION_ENUM,
    DIRECTION_ORDER_ENUM,
    ENTITY_STATE_ENUM,
    EVENT_ENUM,
    PARAMS_NAME_ENUM,
} from '../../Enum'
import EventManager from '../../Runtime/EventManager'
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

    private _direction: DIRECTION_ENUM
    private _state: ENTITY_STATE_ENUM

    get direction() {
        return this._direction
    }

    set direction(newDirection) {
        this._direction = newDirection
        //数字枚举可以number映射string，也可string映射number
        this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION, DIRECTION_ORDER_ENUM[this._direction])
    }

    get state() {
        return this._state
    }

    set state(newState) {
        this._state = newState
        this.fsm.setParams(newState, true)
    }

    async init() {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        this.fsm = this.addComponent(PlayerStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        this.state = ENTITY_STATE_ENUM.IDLE
        this.direction = DIRECTION_ENUM.TOP

        EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
    }

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
            if (this.direction === DIRECTION_ENUM.TOP) {
                this.direction = DIRECTION_ENUM.LEFT
            } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
                this.direction = DIRECTION_ENUM.RIGHT
            } else if (this.direction === DIRECTION_ENUM.LEFT) {
                this.direction = DIRECTION_ENUM.BOTTOM
            } else if (this.direction === DIRECTION_ENUM.RIGHT) {
                this.direction = DIRECTION_ENUM.TOP
            }
            this.state = ENTITY_STATE_ENUM.TURNLEFT
        }
    }
}
