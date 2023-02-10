import { _decorator, Component, Node, Event, AnimationClip, Animation, SpriteFrame } from 'cc'
import State from '../../Base/State'
import { CONTROLLER_ENUM, EVENT_ENUM, FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
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

@ccclass('PlayerStateMachine')
export class PlayerStateMachine extends Component {
    //参数列表和状态机列表，根据当前状态和参数列表决定下一个状态
    private _currentState: State = null
    params: Map<string, IParamsValue> = new Map()
    stateMachines: Map<string, State> = new Map()
    animationComponent: Animation
    waitingList: Array<Promise<SpriteFrame[]>> = []

    //在改变状态的时候希望State播放动画和一些自定义事件
    get currentState() {
        return this._currentState
    }
    set currentState(newState) {
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
        this.params.set(PARAMS_NAME_ENUM.TURNLEFT, getInitParamsTrigger())
    }

    //注册可能有的所有状态
    initStateMachines() {
        this.stateMachines.set(
            PARAMS_NAME_ENUM.IDLE,
            new State(this, 'texture/player/idle/top', AnimationClip.WrapMode.Loop),
        )
        this.stateMachines.set(PARAMS_NAME_ENUM.TURNLEFT, new State(this, 'texture/player/turnleft/top'))
    }

    initAnimationEvent() {
        this.animationComponent.on(Animation.EventType.FINISHED, () => {
            //播放完turn动画后回到IDLE状态
            const name = this.animationComponent.defaultClip.name
            const whiteList = ['turn']
            if (whiteList.some(v => name.includes(v))) {
                this.setParams(PARAMS_NAME_ENUM.IDLE, true)
            }
        })
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

    run() {
        switch (this.currentState) {
            case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
            case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
                if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
                    this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT)
                } else if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
                    this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
                }
                break
            default:
                this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
                break
        }
    }
}
