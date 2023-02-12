import { _decorator, Component, Animation, SpriteFrame } from 'cc'
import { FSM_PARAM_TYPE_ENUM } from '../Enum'
import State from './State'
import { SubStateMachine } from './SubStateMachine'
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

@ccclass('StateMachine')
export default abstract class StateMachine extends Component {
    //参数列表和状态机列表，根据当前状态和参数列表决定下一个状态
    private _currentState: State | SubStateMachine = null
    params: Map<string, IParamsValue> = new Map()
    stateMachines: Map<string, State | SubStateMachine> = new Map()
    animationComponent: Animation
    waitingList: Array<Promise<SpriteFrame[]>> = []

    //在改变状态的时候希望State播放动画和一些自定义事件
    get currentState() {
        return this._currentState
    }
    set currentState(newState) {
        if (!newState) {
            return
        }
        this._currentState = newState
        //播放动画
        this._currentState.run()
    }

    getParams(paramsName: string) {
        if (this.params.has(paramsName)) {
            return this.params.get(paramsName).value
        }
    }

    setParams(paramsName: string, value: ParamsValue) {
        if (this.params.has(paramsName)) {
            this.params.get(paramsName).value = value
            this.run()
            this.resetTrigger()
        }
    }

    //动画完毕后trigger的清空重置
    //https://docs.cocos.com/creator/manual/zh/animation/marionette/animation-graph-panel.html
    resetTrigger() {
        for (const [_, item] of this.params) {
            if (item.type === FSM_PARAM_TYPE_ENUM.TRIGGER) {
                item.value = false
            }
        }
    }

    /***
     * 由子类重写，方法目标是根据当前状态和参数修改currentState
     */
    abstract init(): void
    abstract run(): void
}
