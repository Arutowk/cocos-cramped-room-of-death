import { _decorator, Animation } from 'cc'
import { EntityManager } from '../../Base/EntityManager'
import StateMachine from '../../Base/StateMachine'
import { ENTITY_STATE_ENUM, FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import IdleSubStateMachine from './IdleSubStateMachine'

const { ccclass, property } = _decorator

type ParamsValue = boolean | number

export interface IParamsValue {
    type: FSM_PARAM_TYPE_ENUM
    value: ParamsValue
}

export const getInitParamsTrigger = () => {
    return {
        type: FSM_PARAM_TYPE_ENUM.TRIGGER,
        value: false,
    }
}

export const getInitParamsNumber = () => {
    return {
        type: FSM_PARAM_TYPE_ENUM.NUMBER,
        value: 0,
    }
}

@ccclass('WoodenSkeletonStateMachine')
export class WoodenSkeletonStateMachine extends StateMachine {
    async init() {
        this.animationComponent = this.addComponent(Animation)

        this.initParams()
        this.initStateMachines()
        this.initAnimationEvent()

        //等到所有资源加载完才退出init方法，保证状态在之后设置
        await Promise.all(this.waitingList)
    }

    initParams() {
        this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger())
        this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber())
    }

    //注册可能有的所有状态
    initStateMachines() {
        this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new IdleSubStateMachine(this))
    }

    initAnimationEvent() {
        this.animationComponent.on(Animation.EventType.FINISHED, () => {
            //播放完turn动画后回到IDLE状态
            // const name = this.animationComponent.defaultClip.name
            // const whiteList = ['turn', 'block']
            // if (whiteList.some(v => name.includes(v))) {
            //     this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE
            // }
        })
    }

    run() {
        switch (this.currentState) {
            case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
                if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
                    this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
                } else {
                    //保证触发currentState的set方法，才能触发子状态机的run方法
                    this.currentState = this.currentState
                }
                break
            default:
                this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
                break
        }
    }
}
