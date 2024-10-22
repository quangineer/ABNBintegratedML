import React from 'react';
import { useState } from 'react';
import "../styles/CreateListing.scss";
import Navbar from '../components/Navbar';
import { categories, types, facilities } from '../data';
import { RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
// import excludeVariablesFromRoot from '@mui/material/styles/excludeVariablesFromRoot';
import variables from "../styles/variables.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoIosImages } from "react-icons/io";
import { BiTrash } from 'react-icons/bi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer'

/*Choosing options: */
const CreateListing = () => {
    const [category, setCategory] = useState("")   //empty string because of choosing 1 only
    const [type, setType] = useState("")           //empty string because of choosing 1 only

    /* State for managing the price warning modal */
    const [showPriceWarning, setShowPriceWarning] = useState(false);

    /* LOCATION function */
    const [formLocation, setFormLocation] = useState({
        streetAddress: "",
        aptSuite: "",
        city: "",
        province: "",
        country: ""
    })
    const handleChangeLocation = (e) => {
        const { name, value } = e.target
        setFormLocation({
            ...formLocation,
            [name]: value
        })
    }
    // console.log(formLocation);

    /* BASIC COUNTS */
    const [guestCount, setGuestCount] = useState(1)            //set 1 because at least 1 visitor
    const [bedroomCount, setBedroomCount] = useState(1)
    const [bedCount, setBedCount] = useState(1)
    const [bathroomCount, setBathroomCount] = useState(1)

    /* AMENITIES */
    const [amenities, setAmenities] = useState([]) //empty array bacause of being able to choose more than 1
    const handleSelectAmenities = (facility) => {
        if (amenities.includes(facility)) {
            setAmenities((prevAmenities) => prevAmenities.filter((option) => option !== facility))
        } else {
            setAmenities((prev) => [...prev, facility])
        }
    }
    // console.log(amenities)

    /* Upload, Drag & Drop, remove photos */
    const [photos, setPhotos] = useState([])
    const handleUploadPhotos = (e) => {
        const newPhotos = e.target.files
        setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos])   // the dot dot dot to add multiple photos
    }
    const handleDragPhoto = (result) => {
        if (!result.destination) return
        const items = Array.from(photos)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)     // changable the order of photos

        setPhotos(items)
    }

    const handleRemovePhoto = (indexToRemove) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, index) => index !== indexToRemove))
        // in the previous photos, we filter all photos that have index NOT to remove, so the photos have indexTORemove will disappeared  
    }

    /* Description */
    const [formDescription, setFormDescription] = useState({
        title: "",
        description: "",
        highlight: "",
        highlightDescription: "",
        price: 0
    })
    const handleChangeDescription = (e) => {
        const { name, value } = e.target
        setFormDescription({
            ...formDescription,
            [name]: value
        })
    }
    // console.log(formDescription)

    /* we use user_id */
    const creatorId = useSelector((state) => state.user._id)  //3:34

    // console.log(amenities)
    const navigate = useNavigate()

    /* Setting state for predictedPrice */
    const [predictedPrice, setPredictedPrice] = useState(null);

    const handlePost = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch("http://localhost:3001/predict/predict-price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestCount,
                    bedroomCount,
                    bedCount,
                    bathroomCount,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get predicted price");
            }

            const predictedPrice = await response.json(); // Parse the JSON response
            setPredictedPrice(predictedPrice); // Update the state variable for predictedPrice

            alert(predictedPrice);
            // console.log(predictedPrice);
            alert(formDescription.price < predictedPrice - 100);
            alert(formDescription.price > predictedPrice + 100);
            // ... use predictedPrice for comparison or display ...
            // Validate the price before proceeding
            if (formDescription.price < predictedPrice - 100 || formDescription.price > predictedPrice + 100) {
                setShowPriceWarning(true);
                return;
            }
        } catch (error) {
            console.error("Error fetching predicted price:", error);
            // Handle error gracefully (e.g., display an error message to the user)
        }



        try {
            /*Create a new FormData object to handle file uploads*/
            const listingForm = new FormData()
            listingForm.append("creator", creatorId)
            listingForm.append("category", category)
            listingForm.append("type", type)
            listingForm.append("streetAddress", formLocation.streetAddress)
            listingForm.append("aptSuite", formLocation.aptSuite)
            listingForm.append("city", formLocation.city)
            listingForm.append("province", formLocation.province)
            listingForm.append("country", formLocation.country)
            listingForm.append("guestCount", guestCount)
            listingForm.append("bedroomCount", bedroomCount)
            listingForm.append("bedCount", bedCount)
            listingForm.append("bathroomCount", bathroomCount)
            listingForm.append("amenities", amenities)
            listingForm.append("title", formDescription.title)
            listingForm.append("description", formDescription.description)
            listingForm.append("highlight", formDescription.highlight)
            listingForm.append("highlightDesc", formDescription.highlightDesc)
            listingForm.append("price", formDescription.price)
            /* append each selected photos to the FormData object */
            photos.forEach((photo) => {
                listingForm.append("listingPhotos", photo)  //take the photo first, then need to fetch for the path
            })
            /* Send a POST request to server */
            const response = await fetch("http://localhost:3001/properties/create", {
                method: "POST",
                body: listingForm
            })

            if (response.ok) {
                navigate("/")
            }
        } catch (err) {
            console.log("Publish Listing failed", err.message)
        }
    }

    /* Function to close the warning modal */
    const closePriceWarning = () => {
        setShowPriceWarning(false);
    };

    return (
        <>
            <Navbar />

            <div className='create-listing'>
                <h1>Launch Your Place On Air</h1>
                <form onSubmit={handlePost}>
                    <div className='create-listing_step1'>
                        <h2>Step 1: Tell us about your place</h2>
                        <hr />
                        <h3>Which of the following best matches your place?</h3>
                        <div className='category-list'>
                            {categories?.map((item, index) => (
                                <div className={`category ${category === item.label ? "selected" : ""}`} key={index} onClick={() => setCategory(item.label)}>
                                    <div className='category_icon'>{item.icon}</div>
                                    <p>{item.label}</p>
                                </div>
                            ))}
                        </div>
                        <h3>What types of place will our guests have?</h3>
                        <div className='type-list'>
                            {types?.map((item, index) => (
                                <div className={`type ${type === item.name ? "selected" : ""}`} key={index} onClick={() => setType(item.name)}>
                                    <div className='type_text'>
                                        <h4>{item.name}</h4>
                                        <p>{item.description}</p>
                                    </div>
                                    <div className='type_icon'>{item.icon}</div>
                                </div>
                            ))}
                        </div>

                        <h3>Location Address?</h3>
                        <div className='full'>
                            <div className='location'>
                                <p>Street Address</p>
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    name="streetAddress"
                                    value={formLocation.streetAddress}
                                    onChange={handleChangeLocation}
                                    required
                                />
                            </div>
                        </div>
                        <div className='half'>
                            <div className='location'>
                                <p>Apartment, Suite, etc. (if applicable)</p>
                                <input
                                    type="text"
                                    placeholder="Apt, Suite, etc. (if applicable)"
                                    name="aptSuite"
                                    value={formLocation.aptSuite}
                                    onChange={handleChangeLocation}
                                    required
                                />
                            </div>
                            <div className='location'>
                                <p>City</p>
                                <input
                                    type="text"
                                    placeholder="City"
                                    name="city"
                                    value={formLocation.city}
                                    onChange={handleChangeLocation}
                                    required
                                />
                            </div>
                        </div>
                        <div className='half'>
                            <div className='location'>
                                <p>Province</p>
                                <input
                                    type="text"
                                    placeholder="Province"
                                    name="province"
                                    value={formLocation.province}
                                    onChange={handleChangeLocation}
                                    required
                                />
                            </div>
                            <div className='location'>
                                <p>Country</p>
                                <input
                                    type="text"
                                    placeholder="Country"
                                    name="country"
                                    value={formLocation.country}
                                    onChange={handleChangeLocation}
                                    required
                                />
                            </div>
                        </div>

                        <h3>Select from the following basics about your place</h3>
                        <div className="basics">
                            <div className="basic">
                                <p>Guests</p>
                                <div className="basic_count">
                                    <RemoveCircleOutline
                                        onClick={() => { guestCount > 1 && setGuestCount(guestCount - 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                    <p>{guestCount}</p>
                                    <AddCircleOutline
                                        onClick={() => { setGuestCount(guestCount + 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="basic">
                                <p>Bedrooms</p>
                                <div className="basic_count">
                                    <RemoveCircleOutline
                                        onClick={() => { bedroomCount > 1 && setBedroomCount(bedroomCount - 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                    <p>{bedroomCount}</p>
                                    <AddCircleOutline
                                        onClick={() => { setBedroomCount(bedroomCount + 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="basic">
                                <p>Beds</p>
                                <div className="basic_count">
                                    <RemoveCircleOutline
                                        onClick={() => { bedCount > 1 && setBedCount(bedCount - 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                    <p>{bedCount}</p>
                                    <AddCircleOutline
                                        onClick={() => { setBedCount(bedCount + 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="basic">
                                <p>Bathrooms</p>
                                <div className="basic_count">
                                    <RemoveCircleOutline
                                        onClick={() => { bathroomCount > 1 && setBathroomCount(bathroomCount - 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                    <p>{bathroomCount}</p>
                                    <AddCircleOutline
                                        onClick={() => { setBathroomCount(bathroomCount + 1) }}
                                        sx={{
                                            fontSize: "25px",
                                            cursor: "pointer",
                                            "&:hover": { color: variables.pinkred }
                                        }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='create-listing_step2'>
                        <h2>Step 2: Make your place more informative</h2>
                        <hr />
                        <h3>Tell guests what your place has to offer</h3>
                        <div className="amenities">
                            {facilities?.map((item, index) => (
                                <div className={`facility ${amenities.includes(item.name) ? "selected" : ""}`} key={index} onClick={() => handleSelectAmenities(item.name)}>
                                    <div className='facility_icon'>{item.icon}</div>
                                    <p>{item.name}</p>
                                </div>
                            ))}
                        </div>
                        <h3>Add some photos of your place</h3>
                        <DragDropContext onDragEnd={handleDragPhoto}>
                            <Droppable droppableId='photos' direction='horizontal'>
                                {(provided) => (
                                    <div className='photos' {...provided.droppableProps} ref={provided.innerRef}>
                                        {photos.length < 1 && (
                                            <>
                                                <input id="image" type="file" style={{ display: "none" }} accept="image/*" onChange={handleUploadPhotos} multiple />
                                                <label htmlFor="image" className='alone'>
                                                    <div className="icon"> <IoIosImages /> </div>
                                                    <p>Upload from your device</p>
                                                </label>
                                            </>
                                        )}
                                        {photos.length >= 1 && (
                                            <>
                                                {photos.map((photo, index) => {
                                                    return (
                                                        <Draggable key={index} draggableId={index.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className='photo' ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <img src={URL.createObjectURL(photo)} alt="place" />
                                                                    <button type="button" onClick={() => handleRemovePhoto(index)}>
                                                                        <BiTrash />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                })}
                                                <input id="image" type="file" style={{ display: "none" }} accept="image/*" onChange={handleUploadPhotos} multiple />
                                                <label htmlFor="image" className='together'>
                                                    <div className="icon"> <IoIosImages /> </div>
                                                    <p>Upload from your device</p>
                                                </label>
                                            </>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <h3>What makes your house attractive and worth-visiting?</h3>
                        <div className='description'>
                            <p>Title</p>
                            <input type="text" placeholder='Title' name="title" value={formDescription.title} onChange={handleChangeDescription} required />
                            <p>Description</p>
                            <textarea type="text" placeholder='Description' name="description" value={formDescription.description} onChange={handleChangeDescription} required />
                            <p>Highlight</p>
                            <input type="text" placeholder='Highlight' name="highlight" value={formDescription.highlight} onChange={handleChangeDescription} required />
                            <p>Highlight Details</p>
                            <textarea type="text" placeholder='Highlight details' name="highlightDesc" value={formDescription.highlightDesc} onChange={handleChangeDescription} required />
                            <p>Now, Set your PRICE:</p>
                            <span>$$$</span>
                            <input type="number" placeholder='100' name="price" className='price' value={formDescription.price} onChange={handleChangeDescription} required />
                        </div>
                    </div>

                    <button className='submit_btn' type='submit'>CREATE YOUR LISTING</button>
                </form>
            </div>

            {/* Warning Modal */}
            {showPriceWarning && (
                <div className='modal'>
                    <div className='modal-content'>
                        <h3>Invalid Price</h3>
                        <p>Need-A-Nest suggests our valuable landlord to set your property listing price between ${Math.ceil(predictedPrice-100)} and ${Math.ceil(predictedPrice+100)}. Please enter a valid price.</p>
                        <button onClick={closePriceWarning}>Close</button>
                    </div>
                </div>
            )}
            <Footer />
        </>
    )
}

export default CreateListing