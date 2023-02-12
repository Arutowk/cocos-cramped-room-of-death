import { _decorator, Animation } from 'cc'
import { EntityManager } from '../../Base/EntityManager'
import StateMachine, { getInitParamsNumber, getInitParamsTrigger } from '../../Base/StateMachine'
import {
    ENTITY_STATE_ENUM,
    ENTITY_TYPE_ENUM,
    PARAMS_NAME_ENUM,
    SPIKES_COUNT_ENUM,
    SPIKES_COUNT_MAP_NUMBER_ENUM,
    SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM,
} from '../../Enum'
import SpikesOneSubStateMachine from './SpikesOneSubStateMachine'
import SpikesTwoSubStateMachine from './SpikesTwoSubStateMachine'
import SpikesThreeSubStateMachine from './SpikesThreeSubStateMachine'
import SpikesFourSubStateMachine from './SpikesFourSubStateMachine'
import { SpikesManager } from './SpikesManager'

const { ccclass, property } = _decorator

@ccclass('SpikesStateMachine')
export class SpikesStateMachine extends StateMachine {
    async init() {
        this.animationComponent = this.addComponent(Animation)

        this.initParams()
        this.initStateMachines()
        this.initAnimationEvent()

        //等到所有资源加载完才退出init方法，保证状态在之后设置
        await Promise.all(this.waitingList)
    }

    initParams() {
        this.params.set(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, getInitParamsNumber())
        this.params.set(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, getInitParamsNumber())
    }

    //注册可能有的所有状态
    initStateMachines() {
        this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_ONE, new SpikesOneSubStateMachine(this))
        this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_TWO, new SpikesTwoSubStateMachine(this))
        this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_THREE, new SpikesThreeSubStateMachine(this))
        this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_FOUR, new SpikesFourSubStateMachine(this))
    }

    initAnimationEvent() {
        this.animationComponent.on(Animation.EventType.FINISHED, () => {
            const name = this.animationComponent.defaultClip.name
            const value = this.getParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT)
            //到达最大刺的时候动画回到没有刺
            if (
                (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE && name.includes('spikesone/two')) ||
                (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO && name.includes('spikestwo/three')) ||
                (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE && name.includes('spikesthree/four')) ||
                (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR && name.includes('spikesfour/five'))
            ) {
                this.node.getComponent(SpikesManager).backZero()
            }
        })
    }

    run() {
        const value = this.getParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT)
        switch (this.currentState) {
            case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE):
            case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO):
            case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE):
            case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR):
                if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE) {
                    this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE)
                } else if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO) {
                    this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO)
                } else if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE) {
                    this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE)
                } else if (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR) {
                    this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR)
                } else {
                    //保证触发currentState的set方法，才能触发子状态机的run方法
                    this.currentState = this.currentState
                }
                break
            default:
                this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE)
                break
        }
    }
}
