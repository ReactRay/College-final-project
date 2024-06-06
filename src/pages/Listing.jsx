import React from 'react'
import {useState,useEffect} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {getDoc,doc} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {db} from '../firebase.config'
import Spinner from '../Components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
import SwiperCore,{Navigation,Pagination,Scrollbar,A11y} from 'swiper'
import {Swiper,SwiperSlide} from 'swiper/react'
import 'swiper/swiper-bundle.css'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])




function Listing() {
const [listing,setListing] = useState(null)
const [loading,setLoading] = useState(true)
const [shareLinkCopied,setShareLinkCopied] = useState(null)

const navigate = useNavigate()
const params = useParams()
const auth = getAuth();
 
useEffect(() => {
    const fetchListing = async()=>{
        const docRef = doc(db,'listings',params.listingId)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists()){
            console.log(docSnap.data())
            setListing(docSnap.data())
            setLoading(false)
        }

    }
fetchListing()
},[navigate,params.listingId])
if(loading){
    return <Spinner/>
}
  return (
   <main>
   <Swiper slidesPerView={2} pagination={{ clickable: true }}>
        {listing.imgUrl.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imgUrl[index]}) center no-repeat`,
                backgroundSize: 'cover',
              }}
              className='swiperSlideDiv'
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

    <div className="shareIconDiv" onClick={()=>{
        navigator.clipboard.writeText(window.location.href)
        setShareLinkCopied(true)
        setTimeout(()=>{
            setShareLinkCopied(false)
        },2000)
    }}>
        <img src={shareIcon} alt="share" />
    </div>
    {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

    <div className="listingDetails">
        <p className="listingName">{listing.brand} - {listing.model} ({listing.year}) </p>
        
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
            
            for {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {listing.offer && (
            <p className="discountPrice">
               {listing.price - listing.discountedPrice} ILS discount
            </p>
        )}
        <ul className="listingDetailsList">    
        <li>
            {listing.offer ? listing.discountedPrice : listing.price } ILS
        </li>
            <li>
                
                {listing.seats} seats
            </li>
        </ul>

        {auth.currentUser?.uid !== listing.userRef && (
            <Link 
            to={`/contact/
            ${listing.userRef}?listingName=
            ${listing.brand}
            `}
             className='primaryButton'>
                Contact Owner
            
            </Link>
        )}
    </div>
   </main>
  )
}

export default Listing
