import { _decorator, Component, Sprite, UITransform } from 'cc'
import StateMachine from '../../Base/StateMachine'
import {
    ENTITY_STATE_ENUM,
    ENTITY_TYPE_ENUM,
    EVENT_ENUM,
    PARAMS_NAME_ENUM,
    SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM,
} from '../../Enum'
import { ISpikes } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { randomByLen } from '../../Util'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { SpikesStateMachine } from './SpikesStateMachine'

const { ccclass } = _decorator

@ccclass('SpikesManager')
export class SpikesManager extends Component {
    id: string = randomByLen(12)
    x: number
    y: number
    fsm: StateMachine
    type: ENTITY_TYPE_ENUM
    private _count: number
    private _totalCount: number

    get count() {
        return this._count
    }

    set count(newCount) {
        this._count = newCount
        this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, newCount)
    }

    get totalCount() {
        return this._totalCount
    }

    set totalCount(newCount) {
        this._totalCount = newCount
        this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, newCount)
    }

    async init(params: ISpikes) {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        this.fsm = this.addComponent(SpikesStateMachine)
        await this.fsm.init()

        this.x = params.x
        this.y = params.y
        this.type = params.type
        this.totalCount = SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM[this.type]
        this.count = params.count

        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onLoop, this)
    }

    onLoop() {
        //达到最大值会在动画回调置0，当最大值时还没归零但人又触发移动，就让他变成1就好了
        if (this.count === this.totalCount) {
            this.count = 1
        } else {
            this.count++
        }
        this.onAttack()
    }

    onAttack() {
        const { x: playerX, y: playerY } = DataManager.Instance.player
        if (playerX === this.x && playerY === this.y && this.count === this.totalCount) {
            EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH)
        }
    }

    backZero() {
        this.count = 0
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH - 1.5 * TILE_WIDTH, 1.5 * TILE_HEIGHT - this.y * TILE_HEIGHT)
    }

    onDestroy() {
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onLoop)
    }
}
