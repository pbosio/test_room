export class TimerSystem implements ISystem {
    runningTimers: Timer[] = []
    removedTimers: number[] = []

    public runTimer(time: number, onTimerEnds: ()=>void) : Timer{
        let timer = new Timer(time,onTimerEnds)
        this.run(timer)
        return timer
    }

    public run(timer: Timer){
        timer.reset()
        this.runningTimers.push(timer)
    }

    update(dt: number){
        for (let i=0; i<this.runningTimers.length; i++){
            let timer = this.runningTimers[i]
            timer.updateTime(dt)
            if (timer.hasFinished()){
                this.removedTimers.push(i)
            }
        }
        for (let i=0; i<this.removedTimers.length; i++){
            this.runningTimers.splice(this.removedTimers.pop(), 1)
        }
    }

}

export class Timer {
    protected time: number
    protected timeElapsed: number
    protected onTimerEnds: ()=>void
    protected running: boolean
    protected finished: boolean

    constructor(time: number, onTimerEnds: ()=>void){
        this.time = time
        this.onTimerEnds = onTimerEnds
        this.reset()
    }

    public reset(){
        this.timeElapsed = 0
        this.running = true
        this.finished = false
    }

    public updateTime(dt: number){
        if (this.running){
            this.timeElapsed += dt
            if (this.timeElapsed >= this.time){
                if (this.onTimerEnds)this.onTimerEnds()
                this.timeElapsed = this.time
                this.running = false
                this.finished = true
            }
        }
    }

    public pause(){
        this.running = false
    }

    public resume(){
        this.running = true
    }

    public isRunning(): boolean{
        return this.running
    }

    public hasFinished(): boolean{
        return this.finished
    }

    public getTimeLeft(): number{
        return this.time - this.timeElapsed
    }

    public getElapsedTime(): number{
        return this.timeElapsed
    }
}
