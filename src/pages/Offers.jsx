import React from 'react'
import {useEffect,useState} from 'react'
import {useParams} from 'react-router-dom'
import {collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter}
     from 'firebase/firestore'
     import {db} from '../firebase.config'
     import {toast} from 'react-toastify'
     import Spinner from '../Components/Spinner'
     import ListingItem from '../Components/ListingItem'


function Offers() {

    const [listings,setListings] = useState(null)
    const [loading,setLoading] = useState(true)

    const params = useParams()

    useEffect(()=>{
        const fetchListing = async()=>{
            try {
                //get refrence
                const listingsRef = collection(db,'listings')

                //create a query
                const q = query(listingsRef,where
                  ('offer','==', true),
            orderBy('timestamp', 'desc'),limit(10))
            //ex query
            const querySnap = await getDocs(q)

            let listings = []

            querySnap.forEach((doc)=>{
                
               return listings.push({
                id: doc.id,
                data: doc.data(),
               })

            })
            setListings(listings)
            setLoading(false)
            } catch (error) {
                toast.error('Could not fetch listings')
            }

        }

        fetchListing()

    },[])


  return (
    <div className='category'>
        <header>
            <p className="pageHeader">
              Offers
            </p>
        </header>

        {loading ? <Spinner/> : listings && listings.length > 0 ?
        (<>
        <main>
            <ul className="categoryListings">
                {listings.map((listing)=>{
                    return <ListingItem listing={listing.data} id={listing.id} key={listing.id}/>
                })}
            </ul>
        </main>
        </> ): <p>There are no current offers {params.categoryName}</p>}
 
    </div>
  )
}

export default Offers
