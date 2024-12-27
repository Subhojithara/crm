// "use client"

// import { useUser } from '@clerk/nextjs'
// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'

// interface WithAdminProps {
//   WrappedComponent: React.ComponentType<React.PropsWithChildren<unknown>>;
// }

// const WithAdmin: React.FC<WithAdminProps> = ({ WrappedComponent, ...props }) => {
//   const router = useRouter()
//   const { isLoaded, isSignedIn, user } = useUser()

//   useEffect(() => {
//     if (isLoaded && isSignedIn && !user.publicMetadata.isAdmin) {
//       router.push('/')
//     }
//   }, [isLoaded, isSignedIn, user, router])

//   if (isLoaded && isSignedIn && user.publicMetadata.isAdmin) {
//     return <WrappedComponent {...props} />
//   }

//   return null
// }

// export default WithAdmin