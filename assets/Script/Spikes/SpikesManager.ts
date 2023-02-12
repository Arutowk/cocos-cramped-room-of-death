import { _decorator, Component, Sprite, UITransform } from 'cc'
import StateMachine from '../../Base/StateMachine'
import { ENTITY_TYPE_ENUM, PARAMS_NAME_ENUM, SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM } from '../../Enum'
import { ISpikes } from '../../Level'
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

    private type: ENTITY_TYPE_ENUM
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
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH - 1.5 * TILE_WIDTH, 1.5 * TILE_HEIGHT - this.y * TILE_HEIGHT)
    }

    onDestroy() {}
}
