import { useState, useEffect } from 'react';
import { MemberProfile } from '../types/backend';
import { memberService } from '../services/memberService';

export const useMembers = (includePrivate = false) => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await memberService.getAllMembers(includePrivate);
      setMembers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data anggota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [includePrivate]);

  return { members, loading, error, refetch: fetchMembers };
};
