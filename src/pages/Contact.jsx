import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Contact() {
  const [message, setMessage] = useState('');
  const [carowner, setCarowner] = useState(null);
  const params = useParams();

  useEffect(() => {
    const getCarowner = async () => {
      try {
        const carownerId = params.carownerId?.trim();
        if (!carownerId) {
          toast.error('Car owner ID is missing');
          return;
        }

        const docRef = doc(db, 'users', carownerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCarowner(docSnap.data());
        } else {
          console.error('No such document!');
          toast.error('Could not get car owner data');
        }
      } catch (error) {
        console.error('Error fetching car owner data:', error);
        toast.error('An error occurred while fetching car owner data');
      }
    };

    getCarowner();
  }, [params.carownerId]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!carowner) {
      toast.error('Car owner data not loaded');
      return;
    }

    const mailtoLink = `mailto:${carowner.email}?subject=Message from Contact Form&body=${encodeURIComponent(message)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <div className='pageContainer'>
      <header>
        <p className="pageHeader">
          Contact car owner
        </p>
      </header>
      {carowner ? (
        <main>
          <div className="contactLandLord">
            <p className="landlordName">
              Contact {carowner.name}
            </p>
          </div>

          <form className="messageForm" onSubmit={handleSubmit}>
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows="10"
                className='textarea'
                value={message}
                onChange={onChange}
              ></textarea>
            </div>
            <button type='submit' className="primaryButton">Send Message</button>
          </form>
        </main>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Contact;
