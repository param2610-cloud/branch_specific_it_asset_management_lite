'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react'

const page = () => {

    const [Username , setUsername] = React.useState('');
    const [Password , setPassword] = React.useState('');

    const navigate = useRouter();

    const onClickLogin = async() => {
        try {
            if(Username === '' || Password === ''){
                alert('Please fill all the fields');
                return;
            }
            // make api call to login
            const response = await axios.post('/api/auth/login',{
                username: Username,
                password: Password
            })
            // response.data response from the server
//             {
//     "message": "User is validated.",
//     "user": {
//         "name": "Soumen Pal",
//         "email": "admin@aumcap.com",
//         "username": "aumuser",   
//         "locationId": 1,
//         "password": "$2a$12$h2XrnzgfnpmN6N./AlaIk.eTPcxUMxaTb2Vkq58ykRTK1XPO5AqyK",
//         "secret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiY2YzNzBlNTdiOWIwODYzODQwYzJjNzliMDQ0MzMwMDVjZDhhNjRhZTUzZWVlNjkxM2JjNDY2ZGQ0MWRjNzY0MmIwOGQ0M2YxY2NiNGIwNTgiLCJpYXQiOjE3NTg4NzA4NDUuNjcwMTM5LCJuYmYiOjE3NTg4NzA4NDUuNjcwMTQxLCJleHAiOjIyMzIyNTY0NDUuNjYzMDM0LCJzdWIiOiI3OTIiLCJzY29wZXMiOltdfQ.J1jwzXOkI5VKeZ56T7D98ddGblpo1sju4xF40XJH6opX7lQvPQm2tEKgN3NmxU092SqC1fCQ4RxY_DIAhwtmEDpwsTG5q5KsmYIaM5r50yvWt-mlUS9b_EBNffog1frPN1PmEcJbOhPr39-j_qo_JNQ00dDJ3nWJ_C_xTHJ7bozFYhyKhrzZ_0ACWa46J76nRGnS9b9oxu4f82tjpOfkKSZ0qFInPF1KzlzxSscLkWz13mEtxWnQv1dlkCH8pmasW1ex-ZGjx6kaHu4UXw1HhBRRfWnrIBiLQ7RhwjZ3fEmkYV-lF5HPSaoZfeRmfOJtrHuLO-FbzEIs7e61hJHmaahSrl1y-ElLbTBVbc1TbI92au6tIea0Hxigvv7PW4Imd5U1Uwd5zZUTSgb6grz1x5OpiFbU-W6mltJLrNPwfLut7M_Eq8--OWYwww6I8-rHlC81MzI00kVTowB6cCUqwJlxzWlFXPHuYpGQ_ngOEZkNTCkYqN9uJhGw5pz1UO0Iqtk4n4aM1dQ-3Ar_JkZyGSFHAttkt_BmA50YceodK7HEzYT0v6Pxz1bsWgQ184Fw8oZGoY8Ew7n0I31Xvi7l7lOoJSoYWUcutCElrxzvlHn07ex50-tA_XdkF6xdltgXAtEkTzTNdwKmGW667jI1OfAWnNYw84e8CJoHwu-a-JA"
//     },
//     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF1bXVzZXIiLCJpYXQiOjE3NTk5MDgzOTMsImV4cCI6MTc1OTk5NDc5M30.Li7y4eFjLM0qWW2itwYnu7ZuK9zS9Q_BXHzqNAlDh_0",
//     "status": 200
// }
// store the token in local storage
            localStorage.setItem('token', response.data.accessToken);
            if(response.status === 200){
                navigate.push("/dashboard")
                
                console.log(response);
            }
            if(response.status === 400){
                alert('Invalid input');
            }
            if(response.status === 401){
                alert('User is unauthorized');
            }
            if(response.status === 402){
                alert('User does not exist');
            }
            if(response.status === 500){
                alert('Unexpected error happened');
            }
        } catch (error) {
            console.log(error);
            alert('Internal server error');
        }
    }
  return (
    <div>

        <div>
            Login
        </div>
        <div>
            <div>
                <input value={Username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder='Username' />
                
            </div>
            <div>
                <input value={Password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' />
            </div>
            <div>
                <button onClick={onClickLogin}>
                    Login
                </button>
            </div>
        </div>
    </div>
  )
}

export default page