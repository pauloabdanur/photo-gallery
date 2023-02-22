import { useState, useEffect, FormEvent } from 'react';
import {
  Container,
  Area,
  Header,
  PhotoList,
  ScreenWarning,
  UploadForm,
} from './App.styles';
import * as Photos from './services/photos';
import { Photo } from './types/Photo';
import { PhotoItem } from './components/PhotoItem';

const App = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    getPhotos();
  }, []);

  const getPhotos = async () => {
    setIsLoading(true);
    setPhotos(await Photos.getAll());
    setIsLoading(false);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const file = formData.get('image') as File;

    if (file && file.size > 0) {
      setIsUploading(true);
      let result = await Photos.uploadPhotos(file);
      setIsUploading(false);

      if (result instanceof Error) {
        alert(`${result.name} - ${result.message}`);
      } else {
        let newPhotoList = [...photos];
        newPhotoList.push(result);
        setPhotos(newPhotoList);
      }
    }
  };

  const handleDeletePhoto = async (name: string) => {
    await Photos.deletePhoto(name);
    getPhotos();
  };

  return (
    <Container>
      <Area>
        <Header>Galeria de Fotos</Header>

        {/** Área de Upload */}
        <UploadForm method="POST" onSubmit={handleFormSubmit}>
          <input type="file" name="image" />
          <input type="submit" value="Enviar" />
          {isUploading && 'Enviando...'}
        </UploadForm>

        {/** Lista de Fotos */}
        {isLoading && (
          <ScreenWarning>
            <div className="emoji">✋</div>
            <div>Carregando...</div>
          </ScreenWarning>
        )}

        {!isLoading && photos.length > 0 && (
          <PhotoList>
            {photos.map((item, index) => (
              <PhotoItem
                key={index}
                url={item.url}
                name={item.name}
                onDelete={handleDeletePhoto}
              />
            ))}
          </PhotoList>
        )}

        {!isLoading && photos.length === 0 && (
          <ScreenWarning>
            <div className="emoji">😔</div>
            <div>Não há fotos cadastradas</div>
          </ScreenWarning>
        )}
      </Area>
    </Container>
  );
};

export default App;
