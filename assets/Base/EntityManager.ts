import { _decorator, Component, Sprite, UITransform } from 'cc'
import {
    CONTROLLER_ENUM,
    DIRECTION_ENUM,
    DIRECTION_ORDER_ENUM,
    ENTITY_STATE_ENUM,
    EVENT_ENUM,
    PARAMS_NAME_ENUM,
} from '../Enum'
import { IEntity } from '../Level'
import EventManager from '../Runtime/EventManager'
import { PlayerStateMachine } from '../Script/Player/PlayerStateMachine'
import { TILE_HEIGHT, TILE_WIDTH } from '../Script/Tile/TileManager'
const { ccclass, property } = _decorator

@ccclass('EntityManager')
export class EntityManager extends Component {
    x: number = 0
    y: number = 0
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

    async init(params: IEntity) {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        this.x = params.x
        this.y = params.y
        this.direction = params.direction
        this.state = params.state
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH - 1.5 * TILE_WIDTH, 1.5 * TILE_HEIGHT - this.y * TILE_HEIGHT)
    }
}
