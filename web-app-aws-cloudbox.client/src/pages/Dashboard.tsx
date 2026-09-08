import { useState } from 'react';

import FolderList from '../components/FolderList';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadModal from '../components/UploadModal';
import FileList from '../components/FileList';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export type FileSort =
    | 'name'
    | 'date'
    | 'size'
    | 'type';

export type FileFilter =
    | 'all'
    | 'images'
    | 'pdf'
    | 'documents'
    | 'audio'
    | 'videos'
    | 'other';

export type FileView =
    | 'list'
    | 'grid';

const Dashboard = () => {

    const [refreshFolders, setRefreshFolders] =
        useState(0);

    const [refreshFiles, setRefreshFiles] =
        useState(0);

    const [showCreateFolderModal, setShowCreateFolderModal] =
        useState(false);

    const [showUploadModal, setShowUploadModal] =
        useState(false);

    const [currentFolderId, setCurrentFolderId] =
        useState<number | null>(null);

    const [search, setSearch] =
        useState('');

    const [sortBy, setSortBy] =
        useState<FileSort>('name');

    const [filterType, setFilterType] =
        useState<FileFilter>('all');

    const [showFilters, setShowFilters] =
        useState(false);

    const [viewMode, setViewMode] =
        useState<FileView>(() =>
            window.innerWidth < 768
                ? 'grid'
                : 'list'
        );

    const handleFolderCreated = () => {

        setShowCreateFolderModal(false);

        setRefreshFolders(
            current => current + 1
        );
    };

    const handleUploadCompleted = () => {

        setShowUploadModal(false);

        setRefreshFiles(
            current => current + 1
        );

        setRefreshFolders(
            current => current + 1
        );
    };

    const handleFolderChange = (
        folderId: number | null
    ) => {

        setCurrentFolderId(folderId);
    };

    return (
        <div className="app-wrapper">

            <Header />

            <Sidebar
                usedStorage={68}
                totalStorage={100}
            />

            <main className="app-main">

                <div className="app-content-header cloud-content-header">

                    <div className="container-fluid">

                        <div className="row align-items-center">

                            <div className="col-lg-7">

                                <h1 className="cloud-title">
                                    Mis archivos
                                </h1>

                                <p className="cloud-description">
                                    Administra, organiza y comparte
                                    tus archivos y carpetas.
                                </p>

                                <ol className="breadcrumb cloud-breadcrumb">

                                    <li className="breadcrumb-item">
                                        <a
                                            href="#"
                                            onClick={(event) =>
                                                event.preventDefault()
                                            }
                                        >
                                            CloudBox
                                        </a>
                                    </li>

                                    <li className="breadcrumb-item active">
                                        Mis archivos
                                    </li>

                                </ol>

                            </div>

                            <div className="col-lg-5 text-lg-end mt-3 mt-lg-0">

                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm me-1"
                                    onClick={() =>
                                        setShowCreateFolderModal(true)
                                    }
                                >
                                    <i className="bi bi-folder-plus me-1"></i>
                                    Nueva carpeta
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-cloud btn-sm"
                                    onClick={() =>
                                        setShowUploadModal(true)
                                    }
                                >
                                    <i className="bi bi-cloud-upload me-1"></i>
                                    Subir archivos
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="app-content">

                    <div className="container-fluid">

                        <div className="file-toolbar">

                            <div className="row align-items-center">

                                <div className="col-lg-5">

                                    <div className="input-group input-group-sm toolbar-search">

                                        <span className="input-group-text">
                                            <i className="bi bi-search"></i>
                                        </span>

                                        <input
                                            type="search"
                                            className="form-control"
                                            placeholder="Buscar en mis archivos..."
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="col-lg-7">

                                    <div className="toolbar-actions d-flex justify-content-lg-end gap-2 mt-2 mt-lg-0">

                                        <select
                                            className="form-select form-select-sm"
                                            style={{
                                                maxWidth: '180px'
                                            }}
                                            value={sortBy}
                                            onChange={(event) =>
                                                setSortBy(
                                                    event.target.value as FileSort
                                                )
                                            }
                                        >
                                            <option value="name">
                                                Ordenar: Nombre
                                            </option>

                                            <option value="date">
                                                Ordenar: Fecha
                                            </option>

                                            <option value="size">
                                                Ordenar: Tamaño
                                            </option>

                                            <option value="type">
                                                Ordenar: Tipo
                                            </option>
                                        </select>

                                        <button
                                            type="button"
                                            className={`btn btn - sm ${
    viewMode === 'list'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                            title="Vista de lista"
                                            onClick={() =>
                                                setViewMode('list')
                                            }
                                        >
                                            <i className="bi bi-list"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className={`btn btn - sm ${
    viewMode === 'grid'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                            title="Vista de cuadrícula"
                                            onClick={() =>
                                                setViewMode('grid')
                                            }
                                        >
                                            <i className="bi bi-grid-3x3-gap"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className={`btn btn - sm ${
    showFilters
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                            title="Filtrar"
                                            onClick={() =>
                                                setShowFilters(
                                                    current => !current
                                                )
                                            }
                                        >
                                            <i className="bi bi-funnel"></i>

                                            <span className="d-none d-md-inline ms-1">
                                                Filtrar
                                            </span>
                                        </button>

                                    </div>

                                </div>

                            </div>

                            {showFilters && (

                                <div className="row mt-3">

                                    <div className="col-12">

                                        <div className="card shadow-sm">

                                            <div className="card-body py-3">

                                                <div className="d-flex flex-wrap gap-2 align-items-center">

                                                    <span className="small text-muted">
                                                        Tipo de archivo:
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'all'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('all')
                                                        }
                                                    >
                                                        Todos
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'images'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('images')
                                                        }
                                                    >
                                                        Imágenes
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'pdf'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('pdf')
                                                        }
                                                    >
                                                        PDF
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'documents'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('documents')
                                                        }
                                                    >
                                                        Documentos
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'audio'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('audio')
                                                        }
                                                    >
                                                        Audio
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'videos'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('videos')
                                                        }
                                                    >
                                                        Videos
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn btn - sm ${
    filterType === 'other'
        ? 'btn-primary'
        : 'btn-outline-secondary'
} `}
                                                        onClick={() =>
                                                            setFilterType('other')
                                                        }
                                                    >
                                                        Otros
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>

                        <FolderList
                            refresh={refreshFolders}
                            onFolderChange={handleFolderChange}
                        />

                        <section className="content-section">

                            <div className="d-flex justify-content-between align-items-center mb-2">

                                <div>

                                    <h2 className="section-title">
                                        Archivos
                                    </h2>

                                    <div className="section-description">
                                        Todos los archivos almacenados
                                        en tu cuenta
                                    </div>

                                </div>

                                <div className="small text-muted">
                                    <span>
                                        Archivos
                                    </span>
                                </div>

                            </div>

                            <div className="files-card">

                                <FileList
                                    folderId={currentFolderId}
                                    refresh={refreshFiles}
                                    search={search}
                                    sortBy={sortBy}
                                    filterType={filterType}
                                    viewMode={viewMode}
                                />

                            </div>

                        </section>

                    </div>

                </div>

            </main>

            <CreateFolderModal
                show={showCreateFolderModal}
                onClose={() =>
                    setShowCreateFolderModal(false)
                }
                onCreated={handleFolderCreated}
                parentFolderId={currentFolderId}
            />

            <UploadModal
                show={showUploadModal}
                onClose={() =>
                    setShowUploadModal(false)
                }
                folderId={currentFolderId}
                onUploaded={handleUploadCompleted}
            />

            <Footer />

        </div>
    );
};

export default Dashboard;
