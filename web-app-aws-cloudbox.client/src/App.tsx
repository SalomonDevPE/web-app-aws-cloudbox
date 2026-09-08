import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ProtectedRoute from './components/ProtectedRoute';


function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ==========================================
                    LOGIN
                ========================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />


                {/* ==========================================
                    DASHBOARD - RUTA PROTEGIDA
                ========================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    CUALQUIER RUTA DESCONOCIDA
                ========================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>

        </BrowserRouter>

    );

}


export default App;
