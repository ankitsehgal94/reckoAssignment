import React, { useEffect, useState } from 'react';

import { DropdownButton, Dropdown, Button } from 'react-bootstrap'
import moment from 'moment'
import Chart from 'react-google-charts'

import './styles.css'

function BitcoinView() {

    const currencies = [
        { name: 'Indian Rupee', code: 'INR' },
        { name: 'United States Dollar', code: 'USD' },
        { name: 'Chinese Yuan', code: 'CNY' },
        { name: 'Canadian Dollar', code: 'CAD' },
        { name: 'Burundian Franc', code: 'BIF' },
    ]

    const currentDate = moment().format('YYYY-MM-DD')

    console.log(moment().subtract(1, 'year').format('YYYY-MM-DD'))

    const chartInterval = [
        { name: '1D', start: currentDate, end: moment().subtract(1, 'day').format('YYYY-MM-DD') },
        { name: '5D', start: currentDate, end: moment().subtract(5, 'day').format('YYYY-MM-DD') },
        { name: '6M', start: currentDate, end: moment().subtract(6, 'month').format('YYYY-MM-DD') },
        { name: '1Y', start: currentDate, end: moment().subtract(1, 'year').format('YYYY-MM-DD') }
    ]

    const [bitcoinData, setBitcoinData] = useState('')
    const [updatedTime, setUpdatedTime] = useState('')
    const [bitcoinValue, setBitcoinValue] = useState(1)
    const [bitcoinPrice, setBitcoinPrice] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState('INR')
    const [bitcoinHistoricalData, setBitcoinHistoricalData] = useState(null)
    const [bitcoinChartInterval, setBitcoinChartInterval] = useState(chartInterval[1])
    const [error, setError] = useState('')

    useEffect(() => {
        fetch(`https://api.coindesk.com/v1/bpi/currentprice/${selectedCurrency}.json`)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('result', result)
                    setBitcoinData(result.bpi[selectedCurrency]);
                    if (result.bpi[selectedCurrency].rate.includes(",")) {
                        setBitcoinPrice(parseFloat(result.bpi[selectedCurrency].rate.replace(",", "")));
                    }
                    else setBitcoinPrice(result.bpi[selectedCurrency].rate)
                    setUpdatedTime(result.time.updated)
                },
                (error) => {
                    setError(error)
                }
            )
    }, [selectedCurrency])

    useEffect(() => {
        console.log('result', bitcoinChartInterval)

        fetch(`https://api.coindesk.com/v1/bpi/historical/close.json?start=${bitcoinChartInterval.end}&end=${bitcoinChartInterval.start}&currency=${selectedCurrency}`)
            .then(res => res.json())
            .then(
                (result) => {
                    setBitcoinHistoricalData(Object.keys(result.bpi).map((key) => [moment(key).format('DD MMM'), result.bpi[key]]))
                },
                (error) => {
                    setError(error)
                }
            )
    }, [bitcoinChartInterval, selectedCurrency])


    return (
        <div className='card' color='red'>
            <div className='bitcoinInfo'>
                <div>
                    <p>
                        1 Bitcoin equals
                    </p>
                </div>
                <div>
                    <h2>
                        {bitcoinData.rate} {bitcoinData.description}
                    </h2>
                    <p style={{ fontSize: '20px' }}>
                        {updatedTime} . Disclaimer
                    </p>
                    <div className='bitcoinInputContainer'>
                        <input value={bitcoinValue} onChange={(event) => {
                            if (event.target.value > 1) {
                                setBitcoinValue(event.target.value)
                                setBitcoinPrice(bitcoinPrice * event.target.value)
                            }
                            else {
                                setBitcoinValue(1)
                                setBitcoinPrice(parseFloat(bitcoinData.rate.replace(",", "")))
                            }
                        }} className='bitcoinInputField' />
                        <h5>Bitcoin</h5>
                    </div>
                    <div className='bitcoinInputContainer'>
                        <input value={bitcoinPrice} onChange={(event) => setBitcoinValue(event.target.value)} className='bitcoinInputField' />
                        <DropdownButton id="dropdown-basic-button" title={bitcoinData.description}>
                            <div className='dropdownItems'>
                                {currencies.map(currency => <Dropdown.Item onClick={() => setSelectedCurrency(currency.code)} style={{ color: 'white' }} >{currency.name}</Dropdown.Item>)}
                            </div>
                        </DropdownButton>
                    </div>
                </div>
            </div>
            <div className='chart'>

                <div>
                    {
                        chartInterval.map((interval, index) => {
                            return <Button onClick={() => setBitcoinChartInterval(chartInterval[index])} style={{ marginLeft: 6 }} variant="primary">{interval.name}</Button>
                        })
                    }
                </div>

                {bitcoinHistoricalData && <Chart
                    width={'600px'}
                    height={'400px'}
                    chartType="Line"
                    loader={<div>Loading Chart</div>}
                    data={[
                        [
                            '',
                            '',
                        ],
                        ...bitcoinHistoricalData
                    ]}
                    rootProps={{ 'data-testid': '3' }}
                />}
            </div>
        </div>
    );
}

export default BitcoinView
