import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useState, useEffect, useReducer, createContext, useContext } from "react";
import {max, get_solution, formatNumber, useWindowSize} from "./utils";
import Checkbox from "./Checkbox";
import BarChart from "./BarChart";
import Arrow from "./Arrow";
import styles from '@/styles/SEIR.module.css'

const Slider = ({title, latex='', description='', displayValue, min, max, step, value, callback}) => {
    return (
        <>
            <div className={styles.paneltitle}> {title} {latex ? latex: ''} </div>
            <div className={styles.paneldesc}> {description} </div>
            <div className={styles.slidertext}> {displayValue} </div>
            <input type="range" min={min} max={max} step={step} id={title} name={title} value={value}
                onChange={(e) => callback(e.target.value)}
                style={{width: '90%'}}
            />
        </>
    )
}

const Link = ({ state, color, callback=() => {}, 
            labelText, sumText, changeText, 
            checkable = true, checked = true,
            arrow = true, arrowhead='#arrow', dasharray = '0 0' ,
            screenHeight}) => {
    return (
        screenHeight ? (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "11px", fontWeight: "bold"}}>
                    {state}
                    <Checkbox color={color} checked={checked} callback={callback} checkable={checkable} />
                    { arrow ? <Arrow height={screenHeight/15} arrowhead={arrowhead} dasharray={dasharray} /> : null }
                </div>
                <div style={{ display: "flex", alignItems: "center", flexDirection: "column", maxWidth: "100px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", marginBottom: "10px" }}>{labelText}</span>
                    <span style={{ fontSize: "10px", marginRight: "0px" }}>∑ <i> {sumText}</i></span> 
                    {changeText ? <span style={{ fontSize: "10px", marginRight: "0px" }}>Δ <i> {changeText}</i></span> : null}
                </div>
            </div>
        ) : null
    );
};
  
  
  
const SEIR = () => {

    const size = useWindowSize();

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
        D_death: 32 - 2.9, // Time_to_death - D_infectious 
        CFR: 0.02,
        InterventionTime: 100,
        OMInterventionAmt: 2 / 3,
        InterventionAmt: 1 - 2 / 3, // 1 - OMInterventionAmt
        Time: 220,
        Xmax: 110000,
        dt: 2,
        P_SEVERE: 0.2,
        duration: 7 * 12 * 1e10,
        activeIndex: 110-1, //TODO: change to 100 - 1
        activeTime: 200,
    });
    const [solState, setSolState] = useState(get_solution(inState.dt, inState.N, inState.I0, inState.R0,
        inState.D_incbation, inState.D_infectious, 
        inState.D_recovery_mild, inState.D_hospital_lag,
        inState.D_recovery_severe, inState.D_death,
        inState.P_SEVERE, inState.CFR, inState.InterventionTime,
        inState.InterventionAmt,inState.duration)
    );



    useEffect(() => {
        setSolState(get_solution(inState.dt, inState.N, inState.I0, inState.R0,
            inState.D_incbation, inState.D_infectious, 
            inState.D_recovery_mild, inState.D_hospital_lag,
            inState.D_recovery_severe, inState.Time_to_death - inState.D_infectious,
            inState.P_SEVERE, inState.CFR, inState.InterventionTime,
            1-inState.OMInterventionAmt, inState.duration)
        );
    }, [inState.dt, inState.N, inState.I0, inState.R0,
        inState.D_incbation, inState.D_recovery_severe,
        inState.D_infectious, inState.D_recovery_mild, inState.D_hospital_lag,
        inState.Time_to_death, inState.P_SEVERE, inState.CFR, inState.OMInterventionAmt,
        inState.InterventionTime])

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
    
    const [summation, setSummation] = useState(solState["Iters"][inState.activeIndex]);
    const [diff, setDiff] = useState(solState["dIters"](inState.activeTime, solState["Iters"][inState.activeIndex]));

    useEffect( () => {
        setSummation(solState["Iters"][inState.activeIndex]);
    }, [inState.activeIndex, solState["Iters"]])

    useEffect(() => {
        setDiff(solState["dIters"](inState.activeTime, solState["Iters"][inState.activeIndex]));
    }, [inState.activeTime, inState.activeIndex, solState["dIters"], solState["Iters"]])

    const colors = [ "#386cb0", "#8da0cb", "#4daf4a", "#f0027f", "#fdc086"]

    const [checked, setChecked] = useReducer((state, action) => {
        switch (action.type) {
            case 'set':
                const newState = [...state];
                action.indices.forEach((index, i) => {
                    newState[index] = action.value;
                });
                return newState;
            default:
                return state;
        }
    }, [true, true, false, true, true]);

    const [removed, setRemoved] = useState(false);
    const [recovered, setRecovered] = useState(false);
    const [hospitalized, setHospitalized] = useState(true);
    const [dead, setDead] = useState(true);

    const Context = createContext();
    const [log, setLog] = useState(false);

  return (
    <div>
    <div style={{ display: "flex", flexDirection: "row", marginLeft : "0%", marginRight: "0%"}}>
        {/* // center it and set left and right margins */}
        <div style={{ flex: "1 1 auto", marginLeft: "-5%", alignItems: "center", justifyContent: "center"}}>
            <div style={{ display: "flex", flexDirection: "column" ,alignItems: "center"}}>
                <div style={{marginBottom: '20px'}}>Day {inState.activeTime} </div>
                <Link state={'Susceptible'} color={'grey'} 
                    labelText={'Population not immune to Disease'} 
                    sumText={formatNumber(Math.round(inState.N*summation[0])) + 
                                ' (' + (100*summation[0]).toFixed(2) + '%)'}
                    changeText={ Math.round(inState.N*diff[0]) + ' / day' } 
                    checkable={false}  checked={false}
                    screenHeight={size.height}/>
                <Link state={'Exposed'} color={colors[4]}
                    callback={(checked) => {setChecked({type: 'set', indices: [4], value: checked})}}
                    labelText={'Population currently in incubation'}
                    sumText={formatNumber(Math.round(inState.N*summation[1])) +
                                ' (' + (100*summation[1]).toFixed(2) + '%)'}
                    changeText={ Math.round(inState.N*diff[1]) + ' / day' }
                    checked={true}
                    screenHeight={size.height}/>
                <Link state={'Infectious'} color={colors[3]}
                    callback={(checked) => {setChecked({type: 'set', indices: [3], value: checked})}}
                    labelText={'Number of infections actively circulating'}
                    sumText={formatNumber(Math.round(inState.N*summation[2])) +
                                ' (' + (100*summation[2]).toFixed(2) + '%)'}
                    changeText={ Math.round(inState.N*diff[2]) + ' / day' }
                    checked={true}
                    screenHeight={size.height}/>
                <Context.Provider value={{recovered, hospitalized, dead}}>
                    <Link state={'Removed'} color={'grey'}
                        labelText={'Population no longer infectious due to isolation or immunity'}
                        callback={(checked) => {setChecked({type: 'set', indices: [0,1,2], value: checked})
                                                setRemoved(checked); setRecovered(checked); 
                                                setHospitalized(checked); setDead(checked);
                        }}
                        sumText={formatNumber(Math.round(inState.N*(1- summation[0]-summation[1]-summation[2]))) + 
                                    ' (' + (100*(1-summation[0]-summation[1]-summation[2])).toFixed(2) + '%)'}
                        changeText={ Math.round(inState.N*(diff[3] + diff[4] + diff[5] + diff[6] + diff[7])) + ' / day' }
                        checked={removed} arrowhead={""} dasharray={"3 2"}
                        screenHeight={size.height}/>
                    <Link state={'Recovered'} color={colors[2]}
                        callback={(checked) => {
                            setChecked({type: 'set', indices: [2], value: checked})
                            setRecovered(checked);
                        }}
                        labelText={'Population recovered from infection'}
                        sumText={formatNumber(Math.round(inState.N*(summation[7] + summation[8] )) + 
                                    ' (' + (100*(summation[7] + summation[8])).toFixed(2) + '%)')}
                        checked={recovered} arrowhead={""} dasharray={"3 2"}
                        screenHeight={size.height}/>
                    <Link state={'Hospitalized'} color={colors[1]}
                        callback={(checked) => {
                                setChecked({type: 'set', indices: [1], value: checked})
                                setHospitalized(checked);
                        }}
                        labelText={'Population currently hospitalized'}
                        sumText={formatNumber(Math.round(inState.N*(summation[5] + summation[6]))) +
                                    ' (' + (100*(summation[5] + summation[6])).toFixed(2) + '%)'}
                        changeText={ Math.round(inState.N*(diff[5] + diff[6])) + ' / day' }
                        checked={hospitalized} arrowhead={""} dasharray={"3 2"}
                        screenHeight={size.height}/>
                    <Link state={'Fatalities'} color={colors[0]}
                        callback={(checked) => {
                            setChecked({type: 'set', indices: [0], value: checked})
                            setDead(checked);
                        }}
                        labelText={'Population deceased due to infection'}
                        sumText={formatNumber(Math.round(inState.N*summation[9])) + 
                                    ' (' + (100*summation[9]).toFixed(2) + '%)'}
                        changeText={ Math.round(inState.N*diff[9]) + ' / day' }
                        checked={dead} arrowhead={""} dasharray={"3 2"} 
                        screenHeight={size.height}/>
                </Context.Provider>
                    
            </div>  
        </div>
        <BarChart
            y = {solState["P"].slice(0,100)} 
            xmax = {inState.Xmax} 
            total_infected = {solState["total_infected"].slice(0,100)} 
            deaths = {solState['deaths']} 
            total = {solState['total']}
            timestep={inState.dt}
            tmax={inState.dt * 100}
            N={inState.N}
            ymax={max(solState["P"].slice(0,100), checked)}
            InterventionTime={inState.InterventionTime}
            colors={[ "#386cb0", "#8da0cb", "#4daf4a", "#f0027f", "#fdc086"]}
            log={log}
            checked={checked}
            // render props
            setInterventionState = {(InterventionTime) => {setState( (prev) => ({...prev, InterventionTime: InterventionTime})) }}
            setActiveIndex = {(activeIndex) => {setState( (prev) => ({...prev, activeIndex: activeIndex})) }}
            setActiveTime = {(activeTime) => {setState( (prev) => ({...prev, activeTime: activeTime})) }}
            />
    </div>
    <div className={styles.row}>
        <div className={styles.columns}>
            <Slider title={'Population size'} displayValue={parseInt(inState.N)} 
                        min={5} max={25} step={0.01} value={Math.log(inState.N)} 
                        callback={(value) => setState( (prev) => ({...prev, N: parseInt(Math.exp(value))}) ) }
                        latex={<InlineMath>N</InlineMath>}
                        />
            <Slider title={''} displayValue={parseInt(inState.I0)}
                        description={'Initial number of infections'}
                        min={0} max={10000} step={1} value={inState.I0}
                        callback={(value) => setState( (prev) => ({...prev, I0: parseInt(value)}) ) }
                        latex={<InlineMath>I_0</InlineMath>}/>
        </div>
        <div className={styles.columns}>
            <Slider title={'Basic Reproduction Number'} displayValue={inState.R0.toFixed(2)}
                        description={'Measure of contagiousness'}
                        min={0} max={10} step={0.01} value={inState.R0}
                        callback={(value) => setState( (prev) => ({...prev, R0: parseFloat(value)}) ) }
                        latex={<InlineMath>R_0</InlineMath>}/>
            <Slider title={''} displayValue={(100*(inState.OMInterventionAmt)).toFixed(2) + '%'}
                        description={'Reduction in transmission'}
                        min={0} max={1} step={0.01} value={inState.OMInterventionAmt}
                        callback={(value) => setState( (prev) => ({...prev, OMInterventionAmt: parseFloat(value)}) ) }
                        latex={<div style={{flexDirection: 'row'}}>
                                    <InlineMath>R_t = </InlineMath> 
                                    <span> {((1-inState.OMInterventionAmt)*inState.R0).toFixed(2)} </span> 
                              </div>}
                        />
        </div>
        <div className={styles.columns}>
            <Slider title={'Transmission Times'} displayValue={inState.D_incbation.toFixed(2) + ' days'}
                        min={0.15} max={24} step={0.0001} value={inState.D_incbation}
                        callback={(value) => setState( (prev) => ({...prev, D_incbation: parseFloat(value)}) ) }
                        latex={<InlineMath>{`T_{inc}`}</InlineMath>}
                        />
            <Slider title={''} displayValue={inState.D_infectious.toFixed(2) + ' days'}
                        description={'Infection Duration'}
                        min={0} max={24} step={0.01} value={inState.D_infectious}
                        callback={(value) => setState( (prev) => ({...prev, D_infectious: parseFloat(value)}) ) }
                        latex={<InlineMath>{`T_{inf}`}</InlineMath>}
                        />
        </div>
        <div className={styles.columns}>
            <Slider title={'Morality Statistics'} displayValue={(inState.CFR*100).toFixed(2) + '%'}
                        description={'Case Fatality Rate'}
                        min={0} max={100} step={0.01} value={inState.CFR*100}
                        callback={(value) => setState( (prev) => ({...prev, CFR: parseFloat(value)/100}) ) }
                        />
            <Slider title={''} displayValue={inState.Time_to_death + ' days'}
                        description={'Time from end incubation to death'}
                        min={inState.D_infectious + 0.1} max={100} step={0.01} value={inState.Time_to_death}
                        callback={(value) => setState( (prev) => ({...prev, Time_to_death: parseFloat(value)}) ) }
                        />
        </div>
        <div className={styles.columns}>
            <Slider title = {'Recovery Times'} displayValue={inState.D_recovery_severe + ' days'}
                        description={'Length of hospital stay'}
                        min={0.1} max={100} step={0.01} value={inState.D_recovery_severe}
                        callback={(value) => setState( (prev) => ({...prev, D_recovery_severe: parseFloat(value)}) ) }
                        />
            <Slider title={''} displayValue={inState.D_recovery_mild + ' days'}
                        description={'Recovery time for mild cases'}
                        min={0.5} max={100} step={0.01} value={inState.D_recovery_mild}
                        callback={(value) => setState( (prev) => ({...prev, D_recovery_mild: parseFloat(value)}) ) }
                        />
        </div>
        <div className={styles.columns}>
            <Slider title={'Care Statistics'} displayValue={(inState.P_SEVERE*100).toFixed(2) + '%'}
                        description={'Hospitalization rate'}
                        min={0} max={1} step={0.0001} value={inState.P_SEVERE}
                        callback={(value) => setState( (prev) => ({...prev, P_SEVERE: parseFloat(value)}) ) }
                        />
            <Slider title={''} displayValue={(inState.D_hospital_lag + ' days')}
                        description={'Time to hospitalization'}
                        min={0.5} max={100} step={0.01} value={inState.D_hospital_lag}
                        callback={(value) => setState( (prev) => ({...prev, D_hospital_lag: parseFloat(value)}) ) }
                        />
        </div>
        <div className={styles.columns}>
            <div style={{ margin: '30px' }}>
                Logarithmic Scale
                <Checkbox checked={log} color={'grey'}  callback={()=> {setLog(!log)}} />
            </div>
        </div>


        
    </div>
    </div>
  )
}

export default SEIR;