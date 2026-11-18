// src/hooks/useEducation.js
// Hook untuk mengambil daftar artikel edukasi dan detail artikel dari Supabase
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// Pola validasi UUID v4 standar (case-insensitive)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value.trim())
}

/**
 * Hook untuk memuat daftar seluruh artikel edukasi yang telah dipublikasikan
 */
export function useEducationList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Hanya ambil artikel dengan published = true, urutkan dari yang terbaru
      const { data, error: queryError } = await supabase
        .from('education_articles')
        .select('id, title, category, content, video_url, published, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      setArticles(data || [])
    } catch {
      setError('Gagal memuat daftar artikel edukasi. Silakan periksa koneksi Anda.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return {
    articles,
    loading,
    error,
    refreshArticles: fetchArticles,
  }
}

/**
 * Hook untuk memuat detail satu artikel berdasarkan ID
 * Melakukan validasi format UUID di frontend sebelum memanggil basis data
 */
export function useEducationDetail(id) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const fetchDetail = useCallback(async () => {
    // 1. Validasi format UUID di sisi klien: jika tidak valid, langsung anggap tidak ditemukan
    if (!id || !isUuid(id)) {
      setArticle(null)
      setNotFound(true)
      setError(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setNotFound(false)

      // 2. Kueri menggunakan maybeSingle() sehingga baris yang tidak ada atau tidak published
      //    (diblokir RLS) menghasilkan data null tanpa melempar error Postgres PGRST116
      const { data, error: queryError } = await supabase
        .from('education_articles')
        .select('id, title, category, content, video_url, published, created_at')
        .eq('id', id)
        .eq('published', true)
        .maybeSingle()

      if (queryError) {
        throw queryError
      }

      if (!data) {
        setArticle(null)
        setNotFound(true)
      } else {
        setArticle(data)
        setNotFound(false)
      }
    } catch {
      setError('Gagal memuat artikel. Silakan periksa koneksi Anda dan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return {
    article,
    loading,
    error,
    notFound,
    refetch: fetchDetail,
  }
}
