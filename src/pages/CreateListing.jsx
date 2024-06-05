import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../Components/Spinner'


function CreateListing() {

    const[formData,setFormData] = useState({
        type: 'rent',
        brand: '',
        model: '',
        year: 2020,
        seats: 4,
        location: '',
        offer: false,
        price: 0,
        discountedPrice: 0,
        images : {},

    })

    const {type
        ,brand
        ,model
        ,year
        ,seats
        ,location
        ,offer
        ,price
        ,discountedPrice
        ,images} = formData

    const [loading,setLoading] = useState(false)

    const auth = getAuth();
    const navigate = useNavigate()
    const isMounted = useRef(true)

    useEffect(()=>{
        if(isMounted){
        onAuthStateChanged(auth,(user)=>{
            if(user){
                setFormData({...formData,userRef:user.uid})
            }
            else{
                navigate('/sign-in')
            }
        })
        }

        return ()=>{
            isMounted.current = false
        }
        
    },[isMounted])

    //now here

    const onSubmit = async(e) => {
        e.preventDefault()

        setLoading(true)

        

      
     if (images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

     const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'images/' + fileName)

        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                break
            }
          },
          (error) => {
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imgUrl = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy = {
      ...formData,
      imgUrl,
         timestamp: serverTimestamp(),
    }

    formDataCopy.location = location
    delete formDataCopy.images
    delete formDataCopy.location
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

    const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }
    if(loading){
        return <Spinner/>
    }


  return (
    <div className='profile'>
        <header>
            <p className="pageHeader">
            Create a listing
            </p>
        </header>
        <main>
            <form onSubmit={onSubmit}>
                <labell className='formLabel'>Sell/Rent</labell>
                <div className="formButtons">
                    <button 
                        type='button' 
                        className={type === 'sale' ?
                        'formButtonActive' : 'formButton'
                        } 
                        id='type' value='sale' 
                        onClick={onMutate}>
                        sell
                    </button>

                     <button 
                        type='button' 
                        className={type === 'rent' ?
                        'formButtonActive' : 'formButton'}
                        id='type'
                        value='rent' 
                        onClick={onMutate}>
                            Rent
                    </button>
                </div>

                  <label className='formLabel'>Brand</label>
          <input
            className='formInputName'
            type='text'
            id='brand'
            value={brand}
            onChange={onMutate}
            maxLength='20'
            minLength='2'
            required
          />

            <label className='formLabel'>Model</label>
          <input
            className='formInputName'
            type='text'
            id='model'
            value={model}
            onChange={onMutate}
            maxLength='20'
            minLength='2'
            required
          />

             <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Year</label>
              <input
                className='formInputSmall'
                type='number'
                id='year'
                value={year}
                onChange={onMutate}
                min='1900'
                max='2024'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Seats</label>
              <input
                className='formInputSmall'
                type='number'
                id='seats'
                value={seats}
                onChange={onMutate}
                min='1'
                max='10'
                required
              />
            </div>
          </div>

            <label className='formLabel'>Location</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='location'
            value={location}
            onChange={onMutate}
            required
          />

          
          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

               <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='price'
              value={price}
              onChange={onMutate}
              min='50'
              max='1000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>ILS / Day</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

           <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.jpeg,.png,.JPG,.JPEG,.PNG'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>



            </form>
        </main>
      
    </div>
  )
}

export default CreateListing
