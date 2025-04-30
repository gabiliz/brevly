import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './home'
import { Redirect } from './redirect'
import { NotFound } from './not-found'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path=':shortUrl' element={<Redirect />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
