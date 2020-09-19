import { ref } from 'vue';

const loading = ref(0);

export default function useLoading() {
  return { loading };
}