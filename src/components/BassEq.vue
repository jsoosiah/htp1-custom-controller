<template>
  <div class="transition-container">
    <h5>Filtered Bass EQ</h5>
    <dismissable-alert alert-key="beq-info">
      <p>
        Manage BEQ filters available from the <a href="https://beqcatalogue.readthedocs.io">BEQ Catalog</a>.
      </p><span>
        For more information about BEQ, see the <a
          href="https://www.avsforum.com/threads/bass-eq-for-filtered-movies.2995212/"
          target="_blank"
        >Bass EQ for Filtered Movies</a> AVS Forum thread.
      </span>
    </dismissable-alert>
    <div class="row" v-if="!peqEnabled">
      <div class="col">
        <div class="alert alert-warning small" role="alert">
          BEQ locked down because a Dirac Live ART/BC filter is loaded. Delete all BC/ART filters to regain access.
        </div>
      </div>
    </div>
    <div class="alert alert-secondary mb-3">
      <div
        class="row"
      >
        <div class="col">
          <h6>
            Active BEQ Filter: <a
              v-if="activeBeq"
              href="#"
              @click.prevent="selectedBeq = activeBeq"
            >{{ activeBeq.underlying }}</a>
            <span v-else>
              None
            </span>
          </h6>
        </div>
        <div
          v-if="activeBeq"
          class="col-auto"
        >
          <button
            class="btn btn-sm btn-danger float-right"
            @click="clearAllExistingBeqFilters"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
    <!-- Search Form -->
    <div class="row mb-3">
      <div class="col-lg">
        <div class="form-group">
          <label
            for="search-movie-text"
            class="col-form-label col-form-label-sm"
          >Title</label>
          <input 
            id="search-movie-text" 
            v-model="searchText" 
            type="text" 
            class="form-control form-control-sm"
            @input="page = 0; debouncedGetBeqTableResults()"
          >
        </div>
      </div>
      <div class="col-lg-auto">
        <div
          class="form-group form-group-sm"
        >
          <label
            for="content-type"
            class="col-form-label col-form-label-sm"
          >Content Type</label>
          <select
            id="content-type"
            v-model="contentTypeFilter"
            class="form-control form-control-sm"
            @change="page = 0; getBeqTableResults()"
          >
            <option value="">
              All Types
            </option>
            <option
              v-for="contentType in allContentTypes"
              :key="contentType"
              :value="contentType"
            >
              {{ contentTypeMap[contentType] ? contentTypeMap[contentType] : contentType }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-lg-auto">
        <div
          class="form-group form-group-sm"
        >
          <label
            for="beq-year"
            class="col-form-label col-form-label-sm"
          >Year</label>
          <select
            id="beq-year"
            v-model="yearFilter"
            class="form-control form-control-sm"
            @change="page = 0; getBeqTableResults()"
          >
            <option value="">
              All Years
            </option>
            <option
              v-for="year in allYears"
              :key="year"
            >
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-lg-auto">
        <div
          class="form-group form-group-sm"
        >
          <label
            for="beq-source"
            class="col-form-label col-form-label-sm"
          >Source</label>
          <select
            id="beq-source"
            v-model="sourceFilter"
            class="form-control form-control-sm"
            @change="page = 0; getBeqTableResults()"
          >
            <option value="">
              All Sources
            </option>
            <option
              v-for="source in allSources"
              :key="source"
            >
              {{ source }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-lg-auto">
        <div
          class="form-group form-group-sm"
        >
          <label
            for="beq-language"
            class="col-form-label col-form-label-sm"
          >Language</label>
          <select
            id="beq-language"
            v-model="languageFilter"
            class="form-control form-control-sm"
            @change="page = 0; getBeqTableResults()"
          >
            <option value="">
              All Languages
            </option>
            <option
              v-for="lang in allLanguages"
              :key="lang"
            >
              {{ lang }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="row">
      <!-- Search Results Table -->
      <div class="beq-table col-lg">
        <table
          v-if="beqTableResults.length > 0"
          class="table table-sm table-striped"
        >
          <tbody>
            <tr
              v-for="beq in beqTableResults"
              :key="beq.underlying"
              :class="{'table-active':selectedBeq === beq}"
              @click.prevent="selectedBeq = beq"
            >
              <td>
                <div class="row">
                  <div class="col">
                    <a
                      :href="beq.underlying"
                    >{{ beq.title }} ({{ beq.year }}) {{ beq.edition && `(${beq.edition})` }} {{ beq.season && `S${beq.season}` }} {{ beq.episode && `E${beq.episode}` }} 
                      <small> &#x30FB;
                        <component
                          :is="streamingIconMap[beq.source]"
                          v-if="streamingIconMap[beq.source]"
                        />
                        <span v-else>
                          {{ beq.source }}
                        </span>
                        &#x30FB;
                        {{ beq.audioTypes.join(', ') }}</small></a>
                  </div>
                  <div class="col-auto">
                    <button 
                      class="btn btn-sm btn-primary float-right"
                      @click="applyBeqFilters(beq)"
                      :disabled="!peqEnabled"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div class="row">
                  <div class="col">
                    <small>
                      <font-awesome-icon
                        v-if="beq.content_type === 'film'"
                        :icon="['fas', 'film']"
                      />
                      <font-awesome-icon
                        v-else
                        :icon="['fas', 'tv']"
                      />
                      &#x30FB;
                      {{ getSubtitle(beq) }}</small>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <div class="row justify-content-center">
              <div class="col-auto">
                <nav aria-label="Page navigation example">
                  <ul class="pagination pagination-sm">
                    <li class="page-item">
                      <a
                        class="page-link"
                        href="#"
                        aria-label="Previous"
                        @click.prevent="setPrevPage"
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>
                    <template
                      v-for="(n, i) in pagesToShow"
                      :key="n"
                    >
                      <li

                        class="page-item"
                        :class="{'active': n === page}"
                      >
                        <a
                          class="page-link"
                          href="#"
                          @click.prevent="setPage(n)"
                        >{{ n+1 }}</a>
                      </li>
                      <li
                        v-if="pagesToShow[i+1] && pagesToShow[i+1] !== n + 1"
                        class="page-item disabled"
                      >
                        <a class="page-link">...</a>
                      </li>
                    </template>
                    <li class="page-item">
                      <a
                        class="page-link"
                        href="#"
                        aria-label="Next"
                        @click.prevent="setNextPage"
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </tfoot>
        </table>
        <span v-else>
          No results found for your search.
        </span>
      </div>
      <!-- Details -->
      <div
        class="col beq-detail"
      >
        <template v-if="selectedBeq">
          <div class="row">
            <div class="col">
              <h5>
                {{ selectedBeq.title }} <small>({{ selectedBeq.year }}) {{ selectedBeq.season && `S${selectedBeq.season}` }} {{ selectedBeq.episode && `E${selectedBeq.episode}` }}                 &#x30FB; 
                  <span
                    v-if="streamingIconMap[selectedBeq.source]"
                    :title="selectedBeq.source"
                  ><component
                    :is="streamingIconMap[selectedBeq.source]"
                  /></span>
                  <span v-else>
                    {{ selectedBeq.source }}
                  </span>
                  &#x30FB;
                  {{ selectedBeq.audioTypes.join(', ') }}</small>
              </h5>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <small>
                <font-awesome-icon
                  v-if="selectedBeq.content_type === 'film'"
                  :icon="['fas', 'film']"
                />
                <font-awesome-icon
                  v-else
                  :icon="['fas', 'tv']"
                />
                &#x30FB;
                {{ subtitle }}</small>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <p>{{ selectedBeq.overview }}</p>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <figure class="figure">
                <image-dialog
                  v-for="image in selectedBeq.images"
                  :key="image"
                  :src="image"
                />
                <figcaption class="figure-caption">
                  {{ selectedBeq.author }}
                </figcaption>
              </figure>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash-es';

import useMso from '@/use/useMso';
import useSpeakerGroups from '@/use/useSpeakerGroups.js';
import useResponsive from '@/use/useResponsive.js';

import DismissableAlert from './buttons/DismissableAlert.vue';
import ImageDialog from './buttons/ImageDialog.vue';

import AmazonPrimeVideoIcon from './icons/streaming/AmazonPrimeVideoIcon.vue';
import AppleTvPlusIcon from './icons/streaming/AppleTvPlusIcon.vue';
import DcUniverseIcon from './icons/streaming/DcUniverseIcon.vue';
import DiscIcon from './icons/streaming/DiscIcon.vue';
import DisneyPlusIcon from './icons/streaming/DisneyPlusIcon.vue';
import HboMaxIcon from './icons/streaming/HboMaxIcon.vue';
import HuluIcon from './icons/streaming/HuluIcon.vue';
import NetflixIcon from './icons/streaming/NetflixIcon.vue';
import ParamountPlusIcon from './icons/streaming/ParamountPlusIcon.vue';
import YoutubePremiumIcon from './icons/streaming/YoutubePremiumIcon.vue';

const apiBaseUrl = 'http://htp1.jsoosiah.com/api';

export default {
  components: { DismissableAlert, ImageDialog },
  setup() {

    const { mso, setPEQCenterFrequency, setPEQGain, setPEQFilterType, setPEQQuality,
    addBEQFlag, resetBEQ, addBEQActive, removeBEQActive, setGlobalPEQOn } = useMso();
    const { getActiveChannels } = useSpeakerGroups();
    const { isMobileMode } = useResponsive();

    const searchText = ref('');
    const contentTypeFilter = ref('');
    const languageFilter = ref('');
    const yearFilter = ref('');
    const sourceFilter = ref('');

    const allLanguages = ref([]);
    const allYears = ref([]);
    const allContentTypes = ref([]);
    const allSources = ref([]);

    const beqTableResults = ref([]);
    const totalRows = ref(0);
    const selectedBeq = ref(null);
    const activeBeq = ref(null);
    const page = ref(0);

    const contentTypeMap = {
      'TV': 'TV Shows',
      'film': 'Movies',
    }

    const streamingIconMap = {
      'Amazon': AmazonPrimeVideoIcon,
      'Apple TV+': AppleTvPlusIcon,
      'DC Universe': DcUniverseIcon,
      'Disc': DiscIcon,
      'Disney+': DisneyPlusIcon,
      'HBO Max': HboMaxIcon,
      'Hulu': HuluIcon,
      'Netflix': NetflixIcon,
      'Paramount+': ParamountPlusIcon,
      'YouTube Premium': YoutubePremiumIcon
    };

    const pageSize = isMobileMode ? 10 : 15;

    const subtitle = computed(() => {
      return getSubtitle(selectedBeq.value);
    });

    const totalPages = computed(() => {
      return Math.ceil(totalRows.value / pageSize) - 1;
    });


    const beqActiveUnderlying = computed(() => {
      return mso?.value?.peq?.beqActive;
    });

    const pagesToShow = computed(() => {
      const result = [];

      for (let i = 0; i <= Math.min(2, totalPages.value); i++) {
        result.push(i);
      }
      
      for (let i = page.value - 3; i <= page.value + 3; i++) {
        if (i > 2 && i < totalPages.value - 2) {
          result.push(i);
        }
      }

      for (let i = totalPages.value - 2; i <= totalPages.value; i++) {
        if (i > 2) {
          result.push(i);
        }
      }

      return result;
    });

    const activeSubwoofers = computed(() => {
      return getActiveChannels(mso.value.speakers?.groups).filter(ch => ch.startsWith('sub'));
    });

    watch(beqActiveUnderlying, () => {
      if (beqActiveUnderlying.value) {
        getBeqByUnderlying();
      } else {
        activeBeq.value = null;
      }
    }, {
      immediate: true
    });

    function minutesToHoursAndMinutes(minutes) {
      if (!minutes) {
        return '';
      }
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }

    function getSubtitle(beq) {
      const parts = [
        beq.rating, 
        beq.genres.join(', '), 
        beq.language, 
        minutesToHoursAndMinutes(beq.runtime)
      ];
      return parts.filter(part => part).join(' ・ ');
    }

    async function getBeqTableResults() {
      const response = await fetch(`${apiBaseUrl}/search?q=${encodeURIComponent(searchText.value)}&content_type=${encodeURIComponent(contentTypeFilter.value)}&language=${encodeURIComponent(languageFilter.value)}&year=${encodeURIComponent(yearFilter.value)}&source=${encodeURIComponent(sourceFilter.value)}&p=${page.value}&s=${pageSize}`);
      const data = await response.json();
      beqTableResults.value = data.rows;
      totalRows.value = data.pagination[0] ? data.pagination[0].total : 0;
    }

    async function getBeqByUnderlying() {
      const response = await fetch(`${apiBaseUrl}/lookup/underlying/${encodeURIComponent(beqActiveUnderlying.value)}`);
      const data = await response.json();
      activeBeq.value = data;
    }

    async function getFilterValues() {
      const languagesResponse = fetch(`${apiBaseUrl}/unique/language`);
      const sourcesResponse = fetch(`${apiBaseUrl}/unique/source`);
      const yearsResponse = fetch(`${apiBaseUrl}/unique/year`);
      const contentTypesResponse = fetch(`${apiBaseUrl}/unique/content_type`);
      
      Promise.all([languagesResponse, sourcesResponse, yearsResponse, contentTypesResponse]).then(async values => {
        allLanguages.value = await values[0].json();
        allSources.value = await values[1].json();
        allYears.value = await values[2].json();
        allContentTypes.value = await values[3].json();
      });
    }

    function setPage(p) {
      page.value = p;
      getBeqTableResults();
    }

    function setPrevPage() {
      page.value = Math.max(0, page.value - 1);
      getBeqTableResults();
    }

    function setNextPage() {
      page.value = Math.min(page.value + 1, totalPages.value);
      getBeqTableResults();
    }

    function applyBeqFilters(beq) {
      console.log('apply', beq);
      clearAllExistingBeqFilters();
      // TODO make sure there are enough bands to fit BEQ filters
      for (const ch of activeSubwoofers.value) {
        let slot = 0;
        for (const beqFilter of beq.filters) {
          // find unused slot
          while (mso.value.peq.slots[slot].channels[ch].gaindB !== 0) {
            slot++;
          }
          setPEQCenterFrequency(ch, slot, beqFilter.freq);
          setPEQGain(ch, slot, beqFilter.gain);
          setPEQQuality(ch, slot, beqFilter.q);
          setPEQFilterType(ch, slot, beqFilter.type === 'LowShelf' ? 1 : 0);
          addBEQFlag(ch, slot);
        }
      }

      addBEQActive(beq.underlying);
      setGlobalPEQOn();
    }

    function clearAllExistingBeqFilters() {
      for (const ch of ['sub1', 'sub2', 'sub3', 'sub4', 'sub5']) {
        for (let slot = 0; slot < 16; slot++) {
          if (mso.value.peq.slots[slot].channels[ch].beq) {
            resetBEQ(ch, slot);
          }
        }
      }

      removeBEQActive();
    }

    // const debouncedGetBeqAutocompleteResults = debounce(getBeqAutocompleteResults, 250);
    const debouncedGetBeqTableResults = debounce(getBeqTableResults, 250);

    getBeqTableResults();
    getFilterValues();

    return { mso, beqTableResults, getBeqTableResults, debouncedGetBeqTableResults, searchText, selectedBeq, 
    subtitle, getSubtitle, contentTypeFilter, languageFilter, yearFilter, sourceFilter, page, totalPages, 
    setPrevPage, setNextPage, setPage, pagesToShow, allSources, allLanguages, allContentTypes, allYears, 
    contentTypeMap, applyBeqFilters, clearAllExistingBeqFilters, activeSubwoofers, streamingIconMap,
    activeBeq };
  }
}
</script>

<style scoped>
</style>