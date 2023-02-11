import { animation, AnimationClip, Sprite, SpriteFrame } from 'cc'
import ResourceManager from '../Runtime/ResourceManager'
import { sortSpriteFrame } from '../Util'
import StateMachine from './StateMachine'

const ANIMATION_SPEED = 1 / 8

/**
 * 1.需要知道animationClip
 * 2.需要播放动画的能力
 */
export default class State {
    private animationClip: AnimationClip
    constructor(
        private fsm: StateMachine,
        private path: string,
        private wrapMode: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal,
    ) {
        this.init()
    }

    async init() {
        const promise = ResourceManager.Instance.loadDir(this.path)
        this.fsm.waitingList.push(promise)
        const spriteFrames = await promise
        this.animationClip = new AnimationClip()

        const track = new animation.ObjectTrack() // 创建一个对象轨道
        track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')
        //请求资源的顺序可能是错的，需要对SpriteFrame进行排序
        const frames: Array<[number, SpriteFrame]> = sortSpriteFrame(spriteFrames).map((item, index) => [
            ANIMATION_SPEED * index,
            item,
        ])
        // 添加关键帧
        track.channel.curve.assignSorted(frames)
        // 最后将轨道添加到动画剪辑以应用
        this.animationClip.addTrack(track)
        this.animationClip.name = this.path
        this.animationClip.duration = frames.length * ANIMATION_SPEED //整个动画剪辑的周期
        this.animationClip.wrapMode = this.wrapMode
    }

    run() {
        this.fsm.animationComponent.defaultClip = this.animationClip
        this.fsm.animationComponent.play()
    }
}
