import BarChart from "./BarChart";
import { useState, useEffect } from "react";
import {max, integrate, get_solution} from "./utils";

const SEIR = () => {
    const [inState, setState] = useState({
        Time_to_death: 32,
        logN: Math.log(7e6),
        N: Math.exp(Math.log(7e6)),
        I0: 1,
        R0: 2.2,
        D_incbation: 5.2,
        D_infectious: 2.9,
        D_recovery_mild: 14 - 2.9,
        D_recovery_severe: 31.5 - 2.9,
        D_hospital_lag: 5,
        D_death: 32 - 2.9,
        CFR: 0.02,
        InterventionTime: 100,
        OMInterventionAmt: 2 / 3,
        InterventionAmt: 1 - 2 / 3,
        Time: 220,
        Xmax: 110000,
        dt: 2,
        P_SEVERE: 0.2,
        duration: 7 * 12 * 1e10,
        checked: [true, true, false, true, true],
    });
    const [outState, setOutState] = useState({
        
        Sol: get_solution(inState.dt, inState.N, inState.I0, inState.R0,
                          inState.D_incbation, inState.D_infectious, 
                          inState.D_recovery_mild, inState.D_hospital_lag,
                          inState.D_recovery_severe, inState.D_death,
                          inState.P_SEVERE, inState.CFR, inState.InterventionTime,
                          inState.InterventionAmt,inState.duration
        ),
        timestep: inState.dt,
        tmax: inState.dt * 100,
    });

    useEffect(() => {
        setOutState({
            Sol: get_solution(inState.dt, inState.N, inState.I0, inState.R0,
                inState.D_incbation, inState.D_infectious, 
                inState.D_recovery_mild, inState.D_hospital_lag,
                inState.D_recovery_severe, inState.D_death,
                inState.P_SEVERE, inState.CFR, inState.InterventionTime,
                inState.InterventionAmt,inState.duration
            ),
            timestep: inState.dt,
            tmax: inState.dt * 100,
        })
    }, [...Object.values(inState)])

    // $: Sol            = get_solution(dt, N, I0, R0, D_incbation, D_infectious, D_recovery_mild, D_hospital_lag, D_recovery_severe, D_death, P_SEVERE, CFR, InterventionTime, InterventionAmt, duration)
    // $: P              = Sol["P"].slice(0,100)
    // $: timestep       = dt
    // $: tmax           = dt*100
    // $: deaths         = Sol["deaths"]
    // $: total          = Sol["total"]
    // $: total_infected = Sol["total_infected"].slice(0,100)
    // $: Iters          = Sol["Iters"]
    // $: dIters         = Sol["dIters"]
    // $: Pmax           = max(P, checked)
    // $: lock           = false
    

  
  return (
    <div>
        <BarChart
            y = {outState.Sol["P"].slice(0,100)} 
            xmax = {inState.Xmax} 
            total_infected = {outState.Sol["total_infected"].slice(0,100)} 
            deaths = {outState.Sol['deaths']} 
            total = {outState.Sol['total']}
            timestep={outState.timestep}
            tmax={outState.tmax}
            N={inState.N}
            // ymax={lock ? Plock: Pmax}
            InterventionTime={inState.InterventionTime}
            colors={[ "#386cb0", "#8da0cb", "#4daf4a", "#f0027f", "#fdc086"]}
            />
    </div>
  )
}

export default SEIR;