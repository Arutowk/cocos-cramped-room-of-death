import { _decorator, Component, Sprite, UITransform } from 'cc'
import { EntityManager } from '../../Base/EntityManager'
import {
    CONTROLLER_ENUM,
    DIRECTION_ENUM,
    DIRECTION_ORDER_ENUM,
    ENTITY_STATE_ENUM,
    ENTITY_TYPE_ENUM,
    EVENT_ENUM,
    PARAMS_NAME_ENUM,
} from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { PlayerStateMachine } from './PlayerStateMachine'
const { ccclass, property } = _decorator

@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {
    private readonly speed = 1 / 10
    targetX: number = 0
    targetY: number = 0
    isMoving = false

    async init() {
        this.fsm = this.addComponent(PlayerStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init({
            x: 0,
            y: 0,
            type: ENTITY_TYPE_ENUM.PLAYER,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        this.state = ENTITY_STATE_ENUM.IDLE
        this.direction = DIRECTION_ENUM.TOP

        EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
    }

    update() {
        super.update()
        this.updateXY()
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
