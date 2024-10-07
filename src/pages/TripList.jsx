import React, { useEffect } from 'react'
import { useState } from 'react'
import "../styles/List.scss"
import Loader from '../components/Loader'
import Navbar from '../components/Navbar'
import { useDispatch, useSelector } from 'react-redux'
import { setTripList } from "../redux/state"
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer"



const TripList = () => {
    const [loading, setLoading] = useState(true)
    const userId = useSelector((state) => state.user._id)
    const tripList = useSelector((state) => state.user.tripList)  //check redux for data structure of the user, we Select user here.

    const dispatch = useDispatch()

    const getTripList = async () => {
        try {
            //fetch api thru users in index.js, go deeper 1 layer to user.js
            const response = await fetch(`http://localhost:3001/users/${userId}/trips`, {
                method: "GET"
            })
            const data = await response.json()       //trip list goes to data
            dispatch(setTripList(data))
            setLoading(false)
        } catch (err) {
            console.log("Fetch trip List failed!", err.message)
        }
    }

    useEffect(() => {
        getTripList()
    }, [])


    return loading ? <Loader /> : (
        <>
            <Navbar />
            <h1 className='title-list'>Your Trip List</h1>
            <div className='list'>
                {tripList?.map(({ listingId, hostId, startDate, endDate, totalPrice, booking=true }) => (
                    <ListingCard 
                        listingId={listingId._id} 
                        creator={hostId._id}
                        listingPhotoPaths={listingId.listingPhotoPaths} 
                        city={listingId.city}
                        province={listingId.province}
                        country={listingId.country}
                        category={listingId.category}
                        startDate={startDate} 
                        endDate={endDate} 
                        totalPrice={totalPrice}
                        booking={booking}
                    />    
                ))}
            </div>
            <Footer />
        </>
    );
};

export default TripList