import { supabase } from './supabaseClient'

export async function uploadFile(path:string, file: File | Blob){
  // Supabase expects a File for content-type handling; convert Blob to File when necessary
  let uploadFile = file as File
  if(!(file instanceof File)){
    uploadFile = new File([file], 'upload', { type: (file as Blob).type || 'application/octet-stream' })
  }
  const { data, error } = await supabase.storage.from('media').upload(path, uploadFile, { upsert: false })
  if(error) throw error
  const url = supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl
  return url
}

export async function getPublicUrl(path:string){
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
